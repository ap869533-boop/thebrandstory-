import { Router } from 'express';
import {
  getShortlists,
  createShortlist,
  updateShortlist,
  deleteShortlist
} from '../controllers/shortlistController';

const router = Router();

router.get('/', getShortlists);
router.post('/', createShortlist);
router.put('/:id', updateShortlist);
router.delete('/:id', deleteShortlist);

export default router;
