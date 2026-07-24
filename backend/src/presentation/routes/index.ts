import { Router } from 'express';
import authRoutes from './auth.routes';
import challengeRoutes from './challenge.routes';
import academyRoutes from './academy.routes';
import ticketRoutes from './ticket.routes';
import adminRoutes from './admin.routes';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/challenges', challengeRoutes);
apiRouter.use('/academy', academyRoutes);
apiRouter.use('/tickets', ticketRoutes);
apiRouter.use('/admin', adminRoutes);

// Publicly/User accessible leaderboard
apiRouter.get('/leaderboard', requireAuth, LeaderboardController.getLeaderboard);

export default apiRouter;
