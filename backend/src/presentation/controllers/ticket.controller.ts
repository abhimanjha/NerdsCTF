import { Request, Response } from 'express';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = PrismaService.getInstance();

export class TicketController {
    static async createTicket(req: AuthenticatedRequest, res: Response) {
        const { title, description, priority } = req.body;
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        if (!title || !description) {
            return res.status(400).json({ success: false, error: 'Title and description are required.' });
        }

        try {
            const ticket = await prisma.supportTicket.create({
                data: {
                    userId: req.user.userId,
                    title,
                    description,
                    priority: priority || 'LOW'
                }
            });

            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'CREATE_TICKET',
                    details: `Created support ticket ID ${ticket.id} (${title})`,
                    ipAddress: req.ip
                }
            });

            return res.status(201).json({
                success: true,
                ticket,
                message: 'Support ticket submitted successfully.'
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to create support ticket.' });
        }
    }

    static async getMyTickets(req: AuthenticatedRequest, res: Response) {
        if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        try {
            const tickets = await prisma.supportTicket.findMany({
                where: { userId: req.user.userId },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ success: true, tickets });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to retrieve support tickets.' });
        }
    }

    static async submitFeedback(req: Request, res: Response) {
        // Feedback does not strictly require auth, allows site guests or users to submit
        const { name, email, messageType, feedbackText } = req.body;

        if (!name || !email || !messageType || !feedbackText) {
            return res.status(400).json({ success: false, error: 'All feedback fields must be specified.' });
        }

        try {
            const feedback = await prisma.feedback.create({
                data: {
                    name,
                    email,
                    messageType,
                    feedbackText
                }
            });

            return res.status(201).json({
                success: true,
                feedback,
                message: 'Feedback received. Thank you for making nerdCTF better!'
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: 'Failed to record feedback.' });
        }
    }
}
