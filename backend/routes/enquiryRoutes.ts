import { Router } from 'express';
import {
  getEnquiries,
  createEnquiry,
  updateEnquiryStatus
} from '../controllers/enquiryController';

const router = Router();

router.get('/', getEnquiries);
router.post('/', createEnquiry);
router.patch('/:id', updateEnquiryStatus);

export default router;
