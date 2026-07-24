import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../infrastructure/logging/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error details with request metadata
    Logger.error(
        `${req.method} ${req.url} - Error: ${message}`,
        err.stack,
        'ErrorHandler'
    );

    // Secure response: do not leak raw stack trace in production environments
    res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server configuration issue.' : message
    });
};
