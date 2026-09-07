import { Router } from 'express';
import {
  getHealth,
  getCategories,
  getCities,
  getStats,
  updateStats,
  detectLocation
} from '../controllers/statsController';

const router = Router();

router.get('/health', getHealth);
router.get('/categories', getCategories);
router.get('/cities', getCities);
router.get('/stats', getStats);
router.put('/stats', updateStats);
router.get('/detect-location', detectLocation);

export default router;
