import { Router } from 'express';
import {
  createCreatorPost,
  listCreatorPosts,
  deleteCreatorPost,
  getNearbyCreators,
} from '../controllers/postController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/nearby', getNearbyCreators);
router.get('/:creatorId/posts', listCreatorPosts);
router.post('/posts', authMiddleware, createCreatorPost);
router.delete('/posts/:postId', authMiddleware, deleteCreatorPost);

export default router;
