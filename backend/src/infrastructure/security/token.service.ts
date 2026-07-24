import * as jwt from 'jsonwebtoken';
import { Logger } from '../logging/logger';
import { RedisService } from '../cache/redis.service';

export interface TokenPayload {
    userId: number;
    username: string;
    role: string;
    permissions: string[];
}

export class TokenService {
    private static accessSecret = process.env.JWT_ACCESS_SECRET || 'access_default_secret_key_987654321';
    private static refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_default_secret_key_123456789';

    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.accessSecret, { expiresIn: '15m' });
    }

    static generateRefreshToken(payload: { userId: number }): string {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
    }

    static verifyAccessToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, this.accessSecret) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    static verifyRefreshToken(token: string): { userId: number } | null {
        try {
            return jwt.verify(token, this.refreshSecret) as { userId: number };
        } catch (error) {
            return null;
        }
    }

    static async blacklistToken(token: string, expirySeconds: number): Promise<void> {
        // Blacklist old refresh token in Redis
        await RedisService.set(`blacklist:${token}`, '1', expirySeconds);
    }

    static async isBlacklisted(token: string): Promise<boolean> {
        const result = await RedisService.get(`blacklist:${token}`);
        return result !== null;
    }
}
