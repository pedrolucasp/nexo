import { Router } from "express";
import { UsersController } from '@app/controllers/users';
import multer from '@app/services/avatar';
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.post('/', UsersController.create);
router.put('/:id', UsersController.update);
router.post('/:id/avatar', requireAuth, multer.single('avatar'), UsersController.updateAvatar);

export default router;
