import { Router } from 'express';
import { getEnquiries, createEnquiry, updateEnquiryStatus } from '../controllers/enquiryController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalAuthMiddleware, getEnquiries);
router.post('/', optionalAuthMiddleware, createEnquiry);
router.patch('/:id', authMiddleware, updateEnquiryStatus);

export default router;
