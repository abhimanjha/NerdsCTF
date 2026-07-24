import dotenv from 'dotenv';
import app from './app';
import { RedisService } from './infrastructure/cache/redis.service';
import { Logger } from './infrastructure/logging/logger';
import { PrismaService } from './infrastructure/database/prisma.service';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        // Initialize caching layer
        await RedisService.init();

        // Test DB connection
        const prisma = PrismaService.getInstance();
        await prisma.$connect();
        Logger.info('MySQL Database Connection verified.', 'ServerBootstrap');

        // Start HTTP Listener
        app.listen(PORT, () => {
            Logger.info(`nerdCTF Engine running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`, 'ServerBootstrap');
        });
    } catch (err: any) {
        Logger.error('Critical boot failure. nerdCTF server shutting down.', err.stack, 'ServerBootstrap');
        process.exit(1);
    }
}

bootstrap();
