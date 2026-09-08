import { Router } from 'express';
import {
  getHealth,
  getCategories,
  createCategory,
  deleteCategory,
  getCities,
  getIndustries,
  getStats,
  updateStats,
  detectLocation
} from '../controllers/statsController';

const router = Router();

router.get('/health', getHealth);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/cities', getCities);
router.get('/industries', getIndustries);
router.get('/stats', getStats);
router.put('/stats', updateStats);
router.get('/detect-location', detectLocation);

export default router;
