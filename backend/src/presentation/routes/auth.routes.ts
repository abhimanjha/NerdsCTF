import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);

export default router;
