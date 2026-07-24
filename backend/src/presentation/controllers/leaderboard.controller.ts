import { Request, Response } from 'express';
import { PrismaService } from '../../infrastructure/database/prisma.service';

const prisma = PrismaService.getInstance();

export class LeaderboardController {
    static async getLeaderboard(req: Request, res: Response) {
        try {
            // Find users who are Standard CTF Players (not admin) and aggregate points
            const users = await prisma.user.findMany({
                where: {
                    role: {
                        name: 'USER'
                    }
                },
                select: {
                    id: true,
                    username: true,
                    country: true,
                    avatar: true,
                    createdAt: true,
                    submissions: {
                        where: { isCorrect: true },
                        include: {
                            challenge: {
                                select: { points: true }
                            }
                        }
                    }
                }
            });

            // Map and calculate total points & solve counts
            const rankings = users.map(user => {
                const totalPoints = user.submissions.reduce((sum, sub) => sum + sub.challenge.points, 0);
                const solvedCount = user.submissions.length;
                
                // Mock streak calculations for V1
                const mockStreak = solvedCount > 0 ? Math.min(solvedCount * 2 - 1, 7) : 0;

                return {
                    id: user.id,
                    username: user.username,
                    country: user.country || 'N/A',
                    avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
                    points: totalPoints,
                    solvedLabs: solvedCount,
                    streak: mockStreak
                };
            });

            // Sort by points descending, then solved labs descending
            rankings.sort((a, b) => {
                if (b.points !== a.points) {
                    return b.points - a.points;
                }
                return b.solvedLabs - a.solvedLabs;
            });

            return res.json({
                success: true,
                leaderboard: rankings
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to retrieve leaderboard data.' });
        }
    }
}
