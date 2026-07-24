import { PrismaClient } from '@prisma/client';
import { Logger } from '../logging/logger';

export class PrismaService {
    private static instance: PrismaClient;

    static getInstance(): PrismaClient {
        if (!this.instance) {
            this.instance = new PrismaClient({
                log: ['error', 'warn']
            });
            Logger.info('Prisma Database Client initialized successfully.', 'PrismaService');
        }
        return this.instance;
    }
}
