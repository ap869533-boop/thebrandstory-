import { Router } from 'express';
import { matchCreators, naturalSearch } from '../controllers/aiController';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/ai-matching', rateLimit({ keyPrefix: 'ai-match', windowMs: 60 * 1000, max: 10 }), matchCreators);
router.post('/natural-search', rateLimit({ keyPrefix: 'ai-search', windowMs: 60 * 1000, max: 30 }), naturalSearch);

export default router;
