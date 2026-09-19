import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  applyToCampaign,
  updateApplicantStatus,
  approveCampaign,
  rejectCampaign,
} from '../controllers/campaignController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalAuthMiddleware, getCampaigns);
router.post('/', authMiddleware, createCampaign);
router.patch('/:id', authMiddleware, updateCampaign);
router.delete('/:id', authMiddleware, deleteCampaign);
router.post('/:id/apply', authMiddleware, applyToCampaign);
router.patch('/:id/applicants/:creatorId/status', authMiddleware, updateApplicantStatus);
router.patch('/:id/approve', authMiddleware, approveCampaign);
router.patch('/:id/reject', authMiddleware, rejectCampaign);

export default router;
