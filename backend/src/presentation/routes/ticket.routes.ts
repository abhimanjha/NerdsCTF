import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Submit feedback is public (guest friendly)
router.post('/feedback', TicketController.submitFeedback);

// Tickets require authentications
router.post('/create', requireAuth, TicketController.createTicket);
router.get('/my', requireAuth, TicketController.getMyTickets);

export default router;
