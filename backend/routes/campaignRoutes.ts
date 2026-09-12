import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  deleteCampaign,
  applyToCampaign,
  updateApplicantStatus,
} from '../controllers/campaignController';

const router = Router();

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.delete('/:id', deleteCampaign);
router.post('/:id/apply', applyToCampaign);
router.patch('/:id/applicants/:creatorId/status', updateApplicantStatus);

export default router;
