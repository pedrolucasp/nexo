import { Router } from "express";
import { UsersController } from '@app/controllers/users';
import multer from '@app/services/avatar';
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.post('/', UsersController.create);
router.get('/me', requireAuth, UsersController.me);
router.patch('/me', requireAuth, UsersController.updatePreferences);
router.put('/:id', UsersController.update);
router.post('/me/avatar', requireAuth, multer.single('avatar'), UsersController.updateAvatar);
router.delete('/me/avatar', requireAuth, UsersController.removeAvatar);

export default router;
