import { Router } from 'express';
import { deleteImage, uploadImage } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, uploadImage);
router.delete('/:creatorId', authMiddleware, deleteImage);

export default router;
