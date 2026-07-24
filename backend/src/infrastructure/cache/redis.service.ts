import { createClient } from 'redis';
import { Logger } from '../logging/logger';

export class RedisService {
    private static instance: ReturnType<typeof createClient> | null = null;
    private static isConnected = false;

    static async init(): Promise<void> {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            this.instance = createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 2) {
                            return new Error('Redis connection failed');
                        }
                        return 50; // retry after 50ms
                    }
                }
            });
            this.instance.on('error', (err) => {
                Logger.error('Redis client error', err.stack, 'RedisService');
                this.isConnected = false;
            });
            this.instance.on('connect', () => {
                Logger.info('Connected to Redis cache server', 'RedisService');
                this.isConnected = true;
            });
            await this.instance.connect();
        } catch (error: any) {
            Logger.error('Could not connect to Redis, running without caching layer', error.stack, 'RedisService');
            this.instance = null;
            this.isConnected = false;
        }
    }

    static getClient() {
        return this.instance;
    }

    static async set(key: string, value: string, expirySeconds?: number): Promise<void> {
        if (!this.instance || !this.isConnected) return;
        try {
            if (expirySeconds) {
                await this.instance.set(key, value, { EX: expirySeconds });
            } else {
                await this.instance.set(key, value);
            }
        } catch (error: any) {
            Logger.warn(`Failed to set key "${key}" in Redis: ${error.message}`, 'RedisService');
        }
    }

    static async get(key: string): Promise<string | null> {
        if (!this.instance || !this.isConnected) return null;
        try {
            return await this.instance.get(key);
        } catch (error: any) {
            Logger.warn(`Failed to get key "${key}" from Redis: ${error.message}`, 'RedisService');
            return null;
        }
    }

    static async del(key: string): Promise<void> {
        if (!this.instance || !this.isConnected) return;
        try {
            await this.instance.del(key);
        } catch (error: any) {
            Logger.warn(`Failed to delete key "${key}" from Redis: ${error.message}`, 'RedisService');
        }
    }
}
