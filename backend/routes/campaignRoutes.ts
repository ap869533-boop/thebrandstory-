import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  applyToCampaign,
  updateApplicantStatus,
} from '../controllers/campaignController';

const router = Router();

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/:id/apply', applyToCampaign);
router.patch('/:id/applicants/:creatorId/status', updateApplicantStatus);

export default router;

