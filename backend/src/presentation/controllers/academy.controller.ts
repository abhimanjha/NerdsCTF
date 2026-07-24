import { Response } from 'express';
import { AcademyRepositoryImpl } from '../../infrastructure/repositories/academy.repository.impl';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const academyRepo = new AcademyRepositoryImpl();
const prisma = PrismaService.getInstance();

export class AcademyController {
    static async getTopics(req: AuthenticatedRequest, res: Response) {
        try {
            const topics = await academyRepo.findAllTopics();
            return res.json({ success: true, topics });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to retrieve topics.' });
        }
    }

    static async getLesson(req: AuthenticatedRequest, res: Response) {
        const lessonId = req.params.id;
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        try {
            const lesson = await academyRepo.findLessonById(Number(lessonId));
            if (!lesson) {
                return res.status(404).json({ success: false, error: 'Lesson not found.' });
            }

            // Check if completed already
            const userProgress = await prisma.progress.findUnique({
                where: {
                    userId_lessonId: { userId: req.user.userId, lessonId: Number(lessonId) }
                }
            });

            return res.json({
                success: true,
                lesson,
                completed: userProgress ? userProgress.isCompleted : false
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to load lesson.' });
        }
    }

    static async completeLesson(req: AuthenticatedRequest, res: Response) {
        const { lessonId } = req.body;
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        try {
            await academyRepo.saveProgress(req.user.userId, Number(lessonId), true);

            // Log progress
            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'ACADEMY_PROGRESS',
                    details: `Completed lesson ID ${lessonId}`,
                    ipAddress: req.ip
                }
            });

            // Check if completed all lessons to reward Academy Scholar badge
            const totalLessons = await prisma.lesson.count();
            const completedLessons = await prisma.progress.count({
                where: { userId: req.user.userId, isCompleted: true }
            });

            if (totalLessons === completedLessons && totalLessons > 0) {
                const badge = await prisma.badge.findUnique({ where: { name: 'Academy Scholar' } });
                if (badge) {
                    await prisma.userBadge.upsert({
                        where: { userId_badgeId: { userId: req.user.userId, badgeId: badge.id } },
                        update: {},
                        create: { userId: req.user.userId, badgeId: badge.id }
                    });
                }
            }

            return res.json({ success: true, message: 'Progress saved successfully.' });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to save progress.' });
        }
    }

    static async submitQuiz(req: AuthenticatedRequest, res: Response) {
        const { quizId, selectedOption } = req.body;
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        try {
            const quiz = await prisma.quiz.findUnique({
                where: { id: Number(quizId) }
            });

            if (!quiz) {
                return res.status(404).json({ success: false, error: 'Quiz question not found.' });
            }

            const isCorrect = quiz.correctOption.trim() === selectedOption.trim();
            
            return res.json({
                success: true,
                correct: isCorrect,
                message: isCorrect ? 'Correct Option!' : 'Incorrect option. Review lesson and try again.'
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to process quiz.' });
        }
    }
}
