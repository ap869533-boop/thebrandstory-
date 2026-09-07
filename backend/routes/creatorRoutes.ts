import { Router } from 'express';
import {
  getCreators,
  getCreatorByIdOrUsername,
  createCreator,
  updateCreator,
  addCreatorReview
} from '../controllers/creatorController';

const router = Router();

router.get('/', getCreators);
router.get('/:idOrUsername', getCreatorByIdOrUsername);
router.post('/', createCreator);
router.put('/:id', updateCreator);
router.post('/:id/reviews', addCreatorReview);

export default router;
