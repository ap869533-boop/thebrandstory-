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

import { runAutoMigrations } from '../utils/autoMigrate';

const router = Router();

router.get('/health', getHealth);
router.get('/migrate', async (req, res) => {
  try {
    await runAutoMigrations();
    res.json({ success: true, message: 'Live database auto-migrations executed successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/cities', getCities);
router.get('/industries', getIndustries);
router.get('/stats', getStats);
router.put('/stats', updateStats);
router.get('/detect-location', detectLocation);

export default router;
