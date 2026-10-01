import express from 'express';
import { getIndustries, addIndustry, deleteIndustry } from '../controllers/industryController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Public: get all industries (used in brand signup form)
router.get('/', getIndustries);

// Admin only: add industry
router.post('/', authMiddleware, requireRole('ADMIN', 'SALES'), addIndustry);

// Admin only: delete industry
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'SALES'), deleteIndustry);

export default router;
