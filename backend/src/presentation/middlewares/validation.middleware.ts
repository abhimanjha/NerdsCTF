import { Request, Response, NextFunction } from 'express';

export class ValidationMiddleware {
    static validateRegister(req: Request, res: Response, next: NextFunction) {
        const { email, username, password } = req.body;
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'A valid email address is required.' });
        }
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(400).json({ success: false, error: 'Username must be at least 3 characters long.' });
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
        }
        next();
    }

    static validateLogin(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }
        next();
    }

    static validateFlagSubmit(req: Request, res: Response, next: NextFunction) {
        const { challengeId, flag } = req.body;
        if (!challengeId || isNaN(Number(challengeId))) {
            return res.status(400).json({ success: false, error: 'A valid numeric challengeId is required.' });
        }
        if (!flag || typeof flag !== 'string' || flag.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Flag input cannot be empty.' });
        }
        next();
    }
}
