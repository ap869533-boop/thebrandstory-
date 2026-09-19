import { Router } from 'express';
import {
  getCreators,
  getCreatorByIdOrUsername,
  createCreator,
  updateCreator,
  deleteCreator,
  addCreatorReview
} from '../controllers/creatorController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCreators);
router.get('/:idOrUsername', getCreatorByIdOrUsername);
router.post('/', createCreator);
router.put('/:id', authMiddleware, updateCreator);
router.delete('/:id', authMiddleware, deleteCreator);
router.post('/:id/reviews', authMiddleware, addCreatorReview);

export default router;
