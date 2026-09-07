import { Router } from 'express';
import { matchCreators, naturalSearch } from '../controllers/aiController';

const router = Router();

router.post('/ai-matching', matchCreators);
router.post('/natural-search', naturalSearch);

export default router;
