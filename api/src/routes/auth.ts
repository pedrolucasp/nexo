import { Router } from 'express';
import { AuthController } from '@app/controllers/auth';
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/verify', AuthController.verify);
router.post('/activate', AuthController.activate);
router.post('/resend_code', requireAuth, AuthController.resendActivationCode);

export default router;
