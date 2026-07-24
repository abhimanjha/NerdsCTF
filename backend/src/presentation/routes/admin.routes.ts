import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth + admin verification middleware to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', AdminController.getSystemStats);
router.get('/users', AdminController.getUsers);
router.post('/user/ban', AdminController.toggleBanUser);
router.delete('/user/:userId', AdminController.deleteUser);
router.get('/logs', AdminController.getLogs);
router.get('/tickets', AdminController.getTickets);
router.post('/ticket/status', AdminController.updateTicketStatus);

export default router;
