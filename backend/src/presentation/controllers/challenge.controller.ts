import { Response } from 'express';
import * as crypto from 'crypto';
import { ChallengeRepositoryImpl } from '../../infrastructure/repositories/challenge.repository.impl';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Logger } from '../../infrastructure/logging/logger';

const challengeRepo = new ChallengeRepositoryImpl();
const prisma = PrismaService.getInstance();

export class ChallengeController {
    static async getChallenges(req: AuthenticatedRequest, res: Response) {
        if (!req.user) return res.status(401).json({ success: false, error: 'Context user missing' });
        
        try {
            const challenges = await challengeRepo.findAllActive();
            
            // Map solutions & hints to indicate if already solved or unlocked
            const mapped = await Promise.all(challenges.map(async (c) => {
                const solved = await challengeRepo.hasSolved(req.user!.userId, c.id);
                // Extract hints structure without content (unless solved or unlocked)
                // We'll return titles, tags, difficulty, solved state, and estimated time.
                const hints = await prisma.hint.findMany({
                    where: { challengeId: c.id },
                    select: { id: true, costPoints: true }
                });

                return {
                    id: c.id,
                    title: c.title,
                    difficulty: c.difficulty,
                    description: c.description,
                    objectives: c.objectives,
                    category: c.category.name,
                    points: c.points,
                    tags: c.tags.split(','),
                    estimatedTime: c.estimatedTime,
                    solved,
                    dockerImage: c.dockerImage,
                    hints
                };
            }));

            return res.json({ success: true, challenges: mapped });
        } catch (error: any) {
            Logger.error('Failed to load challenges', error.stack, 'ChallengeController');
            return res.status(500).json({ success: false, error: 'Failed to retrieve challenges.' });
        }
    }

    static async getHint(req: AuthenticatedRequest, res: Response) {
        const { challengeId, hintId } = req.body;
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        try {
            const hint = await challengeRepo.findHintById(Number(hintId));
            if (!hint || hint.challengeId !== Number(challengeId)) {
                return res.status(404).json({ success: false, error: 'Hint not found.' });
            }

            // Check if already solved
            const solved = await challengeRepo.hasSolved(req.user.userId, Number(challengeId));
            if (solved) {
                return res.json({ success: true, hint: hint.content });
            }

            // Deduct score or log cost
            // For simple V1 platform, we unlock hint. In future, we can subtract points from user active score.
            // We write an audit log
            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'UNLOCK_HINT',
                    details: `Unlocked hint ${hintId} for challenge ${challengeId}. Cost: ${hint.costPoints} points.`,
                    ipAddress: req.ip
                }
            });

            return res.json({ success: true, hint: hint.content });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Error unlocking hint.' });
        }
    }

    static async submitFlag(req: AuthenticatedRequest, res: Response) {
        const { challengeId, flag } = req.body;
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        if (!flag) {
            return res.status(400).json({ success: false, error: 'Flag must be provided.' });
        }

        try {
            // Check if user already solved it
            const alreadySolved = await challengeRepo.hasSolved(req.user.userId, Number(challengeId));
            if (alreadySolved) {
                return res.status(400).json({ success: false, error: 'You have already solved this challenge!' });
            }

            // Fetch stored flag hash
            const expectedHash = await challengeRepo.findFlagForChallenge(Number(challengeId));
            if (!expectedHash) {
                return res.status(404).json({ success: false, error: 'Challenge flag config missing.' });
            }

            // Hash the input flag
            const inputHash = crypto.createHash('sha256').update(flag.trim()).digest('hex');
            const isCorrect = (inputHash === expectedHash);

            // Record submission
            await challengeRepo.createSubmission({
                userId: req.user.userId,
                challengeId: Number(challengeId),
                submittedFlag: flag.trim(),
                isCorrect
            });

            // Write user log
            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: isCorrect ? 'CHALLENGE_SOLVED' : 'CHALLENGE_ATTEMPT',
                    details: isCorrect 
                        ? `Solved challenge ID ${challengeId} correctly.` 
                        : `Attempted challenge ID ${challengeId} with incorrect flag: ${flag}`,
                    ipAddress: req.ip
                }
            });

            if (isCorrect) {
                // Check and unlock badges based on score
                const currentScore = await challengeRepo.getUserPoints(req.user.userId);
                const solvedCount = await challengeRepo.countUserSolved(req.user.userId);
                
                // Unlock "First Blood" badge if it's their first solve
                if (solvedCount === 1) {
                    const badge = await prisma.badge.findUnique({ where: { name: 'First Blood' } });
                    if (badge) {
                        await prisma.userBadge.upsert({
                            where: { userId_badgeId: { userId: req.user.userId, badgeId: badge.id } },
                            update: {},
                            create: { userId: req.user.userId, badgeId: badge.id }
                        });
                    }
                }

                // Unlock "Elite Hacker" if score reaches 500
                if (currentScore >= 500) {
                    const badge = await prisma.badge.findUnique({ where: { name: 'Elite Hacker' } });
                    if (badge) {
                        await prisma.userBadge.upsert({
                            where: { userId_badgeId: { userId: req.user.userId, badgeId: badge.id } },
                            update: {},
                            create: { userId: req.user.userId, badgeId: badge.id }
                        });
                    }
                }

                return res.json({
                    success: true,
                    correct: true,
                    message: 'Correct Flag! Congratulations.'
                });
            } else {
                return res.json({
                    success: false,
                    correct: false,
                    message: 'Incorrect flag. Check your spelling or logical derivation and try again.'
                });
            }
        } catch (error: any) {
            Logger.error('Submit flag error', error.stack, 'ChallengeController');
            return res.status(500).json({ success: false, error: 'Verification pipeline error.' });
        }
    }
}
