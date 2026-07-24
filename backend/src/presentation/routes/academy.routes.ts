import { Router } from 'express';
import { AcademyController } from '../controllers/academy.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/topics', AcademyController.getTopics);
router.get('/lesson/:id', AcademyController.getLesson);
router.post('/lesson/complete', AcademyController.completeLesson);
router.post('/quiz/submit', AcademyController.submitQuiz);

export default router;
