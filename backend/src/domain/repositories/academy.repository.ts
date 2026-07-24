import { AcademyTopic, Lesson, Progress, Quiz } from '@prisma/client';

export interface IAcademyRepository {
    findAllTopics(): Promise<(AcademyTopic & { lessons: { id: number; title: string; orderIndex: number }[] })[]>;
    findLessonById(id: number): Promise<(Lesson & { topic: AcademyTopic; quizzes: Quiz[] }) | null>;
    saveProgress(userId: number, lessonId: number, isCompleted: boolean): Promise<Progress>;
    getUserProgress(userId: number): Promise<Progress[]>;
}
