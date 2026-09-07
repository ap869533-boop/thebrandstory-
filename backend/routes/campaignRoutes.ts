import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  applyToCampaign
} from '../controllers/campaignController';

const router = Router();

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/:id/apply', applyToCampaign);

export default router;
