import { PrismaClient, AcademyTopic, Lesson, Progress, Quiz } from '@prisma/client';
import { IAcademyRepository } from '../../domain/repositories/academy.repository';
import { PrismaService } from '../database/prisma.service';

export class AcademyRepositoryImpl implements IAcademyRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaService.getInstance();
    }

    async findAllTopics(): Promise<(AcademyTopic & { lessons: { id: number; title: string; orderIndex: number }[] })[]> {
        return this.prisma.academyTopic.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                lessons: {
                    select: { id: true, title: true, orderIndex: true },
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
    }

    async findLessonById(id: number): Promise<(Lesson & { topic: AcademyTopic; quizzes: Quiz[] }) | null> {
        return this.prisma.lesson.findUnique({
            where: { id },
            include: {
                topic: true,
                quizzes: true
            }
        });
    }

    async saveProgress(userId: number, lessonId: number, isCompleted: boolean): Promise<Progress> {
        return this.prisma.progress.upsert({
            where: {
                userId_lessonId: { userId, lessonId }
            },
            update: {
                isCompleted,
                completedAt: new Date()
            },
            create: {
                userId,
                lessonId,
                isCompleted
            }
        });
    }

    async getUserProgress(userId: number): Promise<Progress[]> {
        return this.prisma.progress.findMany({
            where: { userId, isCompleted: true }
        });
    }
}
