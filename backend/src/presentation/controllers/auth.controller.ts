import { Request, Response } from 'express';
import { UserRepositoryImpl } from '../../infrastructure/repositories/user.repository.impl';
import { HashService } from '../../infrastructure/security/hash.service';
import { TokenService } from '../../infrastructure/security/token.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Logger } from '../../infrastructure/logging/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const userRepo = new UserRepositoryImpl();
const prisma = PrismaService.getInstance();

export class AuthController {
    static async register(req: Request, res: Response) {
        const { email, username, password } = req.body;
        
        if (!email || !username || !password) {
            return res.status(400).json({ success: false, error: 'Email, username, and password are required.' });
        }

        try {
            // Password validation (min 8 chars, 1 capital, 1 symbol)
            const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.' 
                });
            }

            const existingEmail = await userRepo.findByEmail(email);
            if (existingEmail) {
                return res.status(409).json({ success: false, error: 'Email already registered.' });
            }

            const existingUser = await userRepo.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({ success: false, error: 'Username already taken.' });
            }

            const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
            if (!userRole) {
                throw new Error('Default role "USER" not configured.');
            }

            const passwordHash = await HashService.hash(password);
            
            // Create user
            const newUser = await userRepo.create({
                email,
                username,
                passwordHash,
                roleId: userRole.id
            });

            // Write audit log
            await prisma.auditLog.create({
                data: {
                    userId: newUser.id,
                    action: 'REGISTER',
                    details: `User registered successfully with username: ${username}`,
                    ipAddress: req.ip
                }
            });

            Logger.info(`User registered: ${username}`, 'AuthController');
            return res.status(201).json({
                success: true,
                message: 'Registration successful! You can now log in.'
            });
        } catch (error: any) {
            Logger.error('Registration failed', error.stack, 'AuthController');
            return res.status(500).json({ success: false, error: 'Internal registration error.' });
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        try {
            const user = await userRepo.findByEmail(email);
            if (!user) {
                return res.status(401).json({ success: false, error: 'Invalid credentials.' });
            }

            // Check passwords
            const isMatch = await HashService.verify(user.passwordHash, password);
            if (!isMatch) {
                // Audit fail
                await prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: 'LOGIN_FAILURE',
                        details: `Failed login attempt for email: ${email}`,
                        ipAddress: req.ip
                    }
                });
                return res.status(401).json({ success: false, error: 'Invalid credentials.' });
            }

            // Regenerate session tokens
            const permissions = user.role.permissions.map((p: any) => p.name);
            const tokenPayload = {
                userId: user.id,
                username: user.username,
                role: user.role.name,
                permissions
            };

            const accessToken = TokenService.generateAccessToken(tokenPayload);
            const refreshToken = TokenService.generateRefreshToken({ userId: user.id });

            // Store refresh token in DB
            await prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });

            // Set Secure Cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 mins
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Log Login success
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'LOGIN_SUCCESS',
                    details: `User logged in. Session initialized.`,
                    ipAddress: req.ip
                }
            });

            return res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role.name,
                    avatar: user.avatar,
                    country: user.country
                }
            });
        } catch (error: any) {
            Logger.error('Login process encountered error', error.stack, 'AuthController');
            return res.status(500).json({ success: false, error: 'Server authentication pipeline error.' });
        }
    }

    static async refreshToken(req: Request, res: Response) {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, error: 'Refresh token cookie missing.' });
        }

        try {
            // Verify token structure
            const payload = TokenService.verifyRefreshToken(token);
            if (!payload) {
                return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
            }

            // Check if token revoked in DB
            const dbToken = await prisma.refreshToken.findUnique({
                where: { token }
            });

            if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
                // Potential reuse attack! Revoke all tokens for this user for security.
                await prisma.refreshToken.updateMany({
                    where: { userId: payload.userId },
                    data: { isRevoked: true }
                });
                return res.status(401).json({ success: false, error: 'Revoked refresh token detected. Security lockout initiated.' });
            }

            // Fetch user info for new access token
            const user = await userRepo.findById(payload.userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'Associated user context not found.' });
            }

            const permissions = await prisma.role.findUnique({
                where: { id: user.roleId },
                include: { permissions: true }
            }).then(r => r?.permissions.map(p => p.name) || []);

            // Rotate Refresh Token: Generate new pair
            const tokenPayload = {
                userId: user.id,
                username: user.username,
                role: user.role.name,
                permissions
            };

            const newAccessToken = TokenService.generateAccessToken(tokenPayload);
            const newRefreshToken = TokenService.generateRefreshToken({ userId: user.id });

            // Revoke current token and insert new
            await prisma.refreshToken.update({
                where: { token },
                data: { isRevoked: true }
            });

            await prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: newRefreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            });

            // Set updated cookies
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
            });

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.json({ success: true, message: 'Tokens rotated successfully.' });
        } catch (error: any) {
            Logger.error('Token rotation failure', error.stack, 'AuthController');
            return res.status(500).json({ success: false, error: 'Token refresh error.' });
        }
    }

    static async logout(req: AuthenticatedRequest, res: Response) {
        const token = req.cookies.refreshToken;
        if (token) {
            try {
                // Mark token as revoked in DB
                await prisma.refreshToken.update({
                    where: { token },
                    data: { isRevoked: true }
                });
            } catch (err) {}
        }

        // Write Audit log
        if (req.user) {
            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'LOGOUT',
                    details: 'User logged out and session destroyed.',
                    ipAddress: req.ip
                }
            });
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.json({ success: true, message: 'Logged out successfully.' });
    }

    static async getMe(req: AuthenticatedRequest, res: Response) {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthenticated.' });
        }

        try {
            const user = await userRepo.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User details not found.' });
            }

            return res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role.name,
                    avatar: user.avatar,
                    country: user.country,
                    createdAt: user.createdAt
                }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Error fetching user profile.' });
        }
    }
}
