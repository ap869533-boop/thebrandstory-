import { Router } from 'express';
import { deleteImage, uploadImage } from '../controllers/uploadController';

const router = Router();

router.post('/', uploadImage);
router.delete('/:creatorId', deleteImage);

export default router;
