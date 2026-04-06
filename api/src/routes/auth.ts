import { Router } from 'express';
import { AuthController } from '@app/controllers/auth';

const router = Router();

router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/verify', AuthController.verify);

export default router;