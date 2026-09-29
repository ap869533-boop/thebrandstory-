import { Router } from 'express';
import {
  listConversations,
  getMessages,
  sendMessage,
  openOrCreateConversation,
  createCollaborationReview,
  getPublicReviews,
  setTypingStatus,
} from '../controllers/conversationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, listConversations);
router.post('/open', authMiddleware, openOrCreateConversation);
router.post('/reviews', authMiddleware, createCollaborationReview);
router.get('/reviews/:role/:id', getPublicReviews);
router.get('/:id/messages', authMiddleware, getMessages);
router.post('/:id/messages', authMiddleware, sendMessage);
router.post('/:id/typing', authMiddleware, setTypingStatus);

export default router;
