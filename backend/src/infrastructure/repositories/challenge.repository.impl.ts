import { PrismaClient, Challenge, Category, Hint, Submission } from '@prisma/client';
import { IChallengeRepository } from '../../domain/repositories/challenge.repository';
import { PrismaService } from '../database/prisma.service';

export class ChallengeRepositoryImpl implements IChallengeRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaService.getInstance();
    }

    async findById(id: number): Promise<(Challenge & { hints: Hint[] }) | null> {
        return this.prisma.challenge.findUnique({
            where: { id },
            include: { hints: true }
        });
    }

    async findAllActive(): Promise<(Challenge & { category: Category })[]> {
        return this.prisma.challenge.findMany({
            where: { isActive: true },
            include: { category: true }
        });
    }

    async findAllAdmin(): Promise<Challenge[]> {
        return this.prisma.challenge.findMany({
            include: { category: true }
        });
    }

    async create(data: any): Promise<Challenge> {
        return this.prisma.challenge.create({
            data
        });
    }

    async update(id: number, data: any): Promise<Challenge> {
        return this.prisma.challenge.update({
            where: { id },
            data
        });
    }

    async delete(id: number): Promise<Challenge> {
        return this.prisma.challenge.delete({
            where: { id }
        });
    }

    async findFlagForChallenge(challengeId: number): Promise<string | null> {
        const flag = await this.prisma.flag.findFirst({
            where: { challengeId }
        });
        return flag ? flag.flagHash : null;
    }

    async createSubmission(data: { userId: number; challengeId: number; submittedFlag: string; isCorrect: boolean }): Promise<Submission> {
        return this.prisma.submission.create({
            data
        });
    }

    async hasSolved(userId: number, challengeId: number): Promise<boolean> {
        const submission = await this.prisma.submission.findFirst({
            where: { userId, challengeId, isCorrect: true }
        });
        return submission !== null;
    }

    async countUserSolved(userId: number): Promise<number> {
        return this.prisma.submission.count({
            where: { userId, isCorrect: true }
        });
    }

    async getUserPoints(userId: number): Promise<number> {
        // Fetch all correct submissions for user
        const solves = await this.prisma.submission.findMany({
            where: { userId, isCorrect: true },
            include: { challenge: true }
        });
        return solves.reduce((sum, solve) => sum + solve.challenge.points, 0);
    }

    async findHintById(hintId: number): Promise<Hint | null> {
        return this.prisma.hint.findUnique({
            where: { id: hintId }
        });
    }
}
