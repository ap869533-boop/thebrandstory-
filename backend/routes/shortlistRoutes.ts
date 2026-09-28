import { Router } from 'express';
import {
  getShortlists,
  createShortlist,
  updateShortlist,
  deleteShortlist
} from '../controllers/shortlistController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getShortlists);
router.post('/', authMiddleware, createShortlist);
router.put('/:id', authMiddleware, updateShortlist);
router.delete('/:id', authMiddleware, deleteShortlist);

export default router;
