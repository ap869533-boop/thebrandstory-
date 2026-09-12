import { Router } from 'express';
import {
  getCreators,
  getCreatorByIdOrUsername,
  createCreator,
  updateCreator,
  deleteCreator,
  addCreatorReview
} from '../controllers/creatorController';

const router = Router();

router.get('/', getCreators);
router.get('/:idOrUsername', getCreatorByIdOrUsername);
router.post('/', createCreator);
router.put('/:id', updateCreator);
router.delete('/:id', deleteCreator);
router.post('/:id/reviews', addCreatorReview);

export default router;
