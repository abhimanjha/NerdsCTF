import * as argon2 from 'argon2';
import { Logger } from '../logging/logger';

export class HashService {
    static async hash(plainText: string): Promise<string> {
        try {
            return await argon2.hash(plainText, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16, // 64 MB
                timeCost: 3,
                parallelism: 4
            });
        } catch (error: any) {
            Logger.error('Failed to hash content', error.stack, 'HashService');
            throw new Error('Hash operations failed');
        }
    }

    static async verify(hash: string, plainText: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plainText);
        } catch (error: any) {
            Logger.error('Hash verification error', error.stack, 'HashService');
            return false;
        }
    }
}
