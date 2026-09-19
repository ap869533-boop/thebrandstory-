import { Router } from 'express';
import {
  listConversations,
  getMessages,
  sendMessage,
  openOrCreateConversation,
  createCollaborationReview,
  getPublicReviews,
} from '../controllers/conversationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, listConversations);
router.post('/open', authMiddleware, openOrCreateConversation);
router.post('/reviews', authMiddleware, createCollaborationReview);
router.get('/reviews/:role/:id', getPublicReviews);
router.get('/:id/messages', authMiddleware, getMessages);
router.post('/:id/messages', authMiddleware, sendMessage);

export default router;
