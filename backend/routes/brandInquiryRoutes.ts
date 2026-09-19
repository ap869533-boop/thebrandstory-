import { Router } from 'express';
import {
  getBrandInquiries,
  createBrandInquiry,
  updateBrandInquiryStatus,
} from '../controllers/brandInquiryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getBrandInquiries);
router.post('/', authMiddleware, createBrandInquiry);
router.patch('/:id', authMiddleware, updateBrandInquiryStatus);

export default router;
