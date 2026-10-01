import { Router } from 'express';
import {
  getPartnerBrands,
  createPartnerBrand,
  deletePartnerBrand,
} from '../controllers/brandPartnerController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getPartnerBrands);
router.post('/', authMiddleware, requireRole('ADMIN', 'SALES'), createPartnerBrand);
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'SALES'), deletePartnerBrand);

export default router;
