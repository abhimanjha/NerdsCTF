import { Challenge, Category, Hint, Submission } from '@prisma/client';

export interface IChallengeRepository {
    findById(id: number): Promise<(Challenge & { hints: Hint[] }) | null>;
    findAllActive(): Promise<(Challenge & { category: Category })[]>;
    findAllAdmin(): Promise<Challenge[]>;
    create(data: any): Promise<Challenge>;
    update(id: number, data: any): Promise<Challenge>;
    delete(id: number): Promise<Challenge>;
    
    // Flag & Submission
    findFlagForChallenge(challengeId: number): Promise<string | null>;
    createSubmission(data: { userId: number; challengeId: number; submittedFlag: string; isCorrect: boolean }): Promise<Submission>;
    hasSolved(userId: number, challengeId: number): Promise<boolean>;
    countUserSolved(userId: number): Promise<number>;
    getUserPoints(userId: number): Promise<number>;
    
    // Hints
    findHintById(hintId: number): Promise<Hint | null>;
}
