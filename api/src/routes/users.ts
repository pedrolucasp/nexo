import { Router } from "express";
import { UsersController } from '@app/controllers/users'
import multer from '@app/services/avatar';

const router = Router();

router.post('/', UsersController.create);
router.put('/:id', UsersController.update);
router.post('/:id/avatar', multer.single('avatar'), UsersController.updateAvatar);

export default router;
