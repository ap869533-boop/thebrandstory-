import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getBrandProfile,
  createBrandProfile,
  updateBrandProfile,
  adminListBrands,
  adminApproveBrand,
  adminDeleteBrand,
  getFeaturedBrands,
  adminGetPendingCampaigns,
  adminApproveCampaign,
} from '../controllers/brandController';

const router = Router();

// Public routes
router.get('/featured', getFeaturedBrands);

// Brand authenticated routes
router.get('/profile', authMiddleware, getBrandProfile);
router.post('/profile', authMiddleware, createBrandProfile);
router.put('/profile', authMiddleware, updateBrandProfile);

// Admin routes
router.get('/admin/list', authMiddleware, adminListBrands);
router.patch('/admin/:id/approve', authMiddleware, adminApproveBrand);
router.delete('/admin/:id', authMiddleware, adminDeleteBrand);
router.get('/admin/campaigns/pending', authMiddleware, adminGetPendingCampaigns);
router.patch('/admin/campaigns/:id/approve', authMiddleware, adminApproveCampaign);

export default router;
