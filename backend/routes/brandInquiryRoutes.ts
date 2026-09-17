import { Router } from 'express';
import {
  getBrandInquiries,
  createBrandInquiry,
} from '../controllers/brandInquiryController';

const router = Router();

router.get('/', getBrandInquiries);
router.post('/', createBrandInquiry);

export default router;
