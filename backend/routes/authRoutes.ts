import { Router } from 'express';
import { signup, login, getMe, requestOtp, verifyOtp, changePassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/change-password', authMiddleware, changePassword);

export default router;
