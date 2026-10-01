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

import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/health', getHealth);
router.get('/categories', getCategories);
router.post('/categories', authMiddleware, requireRole('ADMIN', 'SALES'), createCategory);
router.delete('/categories/:id', authMiddleware, requireRole('ADMIN', 'SALES'), deleteCategory);
router.get('/cities', getCities);
router.get('/industries', getIndustries);
router.get('/stats', getStats);
router.put('/stats', authMiddleware, requireRole('ADMIN', 'SALES'), updateStats);
router.get('/detect-location', detectLocation);

export default router;
