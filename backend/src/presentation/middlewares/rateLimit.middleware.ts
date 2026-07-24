import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 logins/signups per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many login attempts. Please try again after 15 minutes.'
    }
});
