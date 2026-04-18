import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';
import * as AuthController from '../controllers/auth.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.put('/change-password', authMiddleware, AuthController.changePassword);

// CV Vault Endpoints
router.post('/cv', authMiddleware, upload.single('file'), AuthController.uploadCV);
router.delete('/cv/:id', authMiddleware, AuthController.deleteCV);

export default router;
