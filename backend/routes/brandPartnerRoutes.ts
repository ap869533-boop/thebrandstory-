import { Router } from 'express';
import {
  getPartnerBrands,
  createPartnerBrand,
  deletePartnerBrand,
} from '../controllers/brandPartnerController';

const router = Router();

router.get('/', getPartnerBrands);
router.post('/', createPartnerBrand);
router.delete('/:id', deletePartnerBrand);

export default router;
