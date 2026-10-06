import express from 'express';
import { 
  getFaqs, 
  getAdminFaqs, 
  addFaq, 
  updateFaq, 
  deleteFaq,
  createTicket,
  getTicketByToken,
  getAdminTickets,
  getAdminTicketDetails,
  adminReplyTicket
} from '../controllers/supportController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// ==============================
// PUBLIC ROUTES
// ==============================
router.get('/faqs', getFaqs);
// optionalAuthMiddleware allows guests to proceed without a token, but parses token if it exists
router.post('/tickets', optionalAuthMiddleware, createTicket); 
router.get('/tickets/:id/token/:token', getTicketByToken);

// ==============================
// ADMIN ROUTES
// ==============================
// Middleware to ensure user is ADMIN or SALES would typically go here, but for now we rely on authMiddleware + frontend guards, or we can check inside the controller.
router.get('/admin/faqs', authMiddleware, getAdminFaqs);
router.post('/admin/faqs', authMiddleware, addFaq);
router.put('/admin/faqs/:id', authMiddleware, updateFaq);
router.delete('/admin/faqs/:id', authMiddleware, deleteFaq);

router.get('/admin/tickets', authMiddleware, getAdminTickets);
router.get('/admin/tickets/:id', authMiddleware, getAdminTicketDetails);
router.post('/admin/tickets/:id/reply', authMiddleware, adminReplyTicket);

export default router;
