import { Router } from 'express';
import { ChallengeController } from '../controllers/challenge.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', ChallengeController.getChallenges);
router.get('/stats', ChallengeController.getStats);
router.get('/:id', ChallengeController.getChallengeById);
router.post('/hint', ChallengeController.getHint);
router.post('/submit', ChallengeController.submitFlag);

export default router;
