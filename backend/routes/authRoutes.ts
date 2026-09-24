import { Router } from 'express';
import { signup, login, getMe, requestOtp, verifyOtp, changePassword, forgotPasswordOtp, resetPassword, checkEmailAvailability } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/check-email', checkEmailAvailability);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/change-password', authMiddleware, changePassword);
router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/reset-password', resetPassword);

export default router;
