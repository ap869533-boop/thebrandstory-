import { Router } from 'express';
import { signup, login, getMe, requestOtp, verifyOtp, changePassword, forgotPasswordOtp, resetPassword, checkEmailAvailability } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/signup', signup);
router.post('/check-email', checkEmailAvailability);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

router.post('/request-otp', rateLimit({ keyPrefix: 'otp-request', windowMs: 15 * 60 * 1000, max: 5 }), requestOtp);
router.post('/verify-otp', rateLimit({ keyPrefix: 'otp-verify', windowMs: 15 * 60 * 1000, max: 10 }), verifyOtp);
router.post('/change-password', authMiddleware, changePassword);
router.post('/forgot-password-otp', rateLimit({ keyPrefix: 'password-otp', windowMs: 15 * 60 * 1000, max: 5 }), forgotPasswordOtp);
router.post('/reset-password', rateLimit({ keyPrefix: 'password-reset', windowMs: 15 * 60 * 1000, max: 10 }), resetPassword);

export default router;
