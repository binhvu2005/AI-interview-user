import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';
import * as AuthController from '../controllers/auth.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleLogin);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.getMe);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.put('/change-password', authMiddleware, AuthController.changePassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/reset-password', AuthController.resetPassword);

// CV Vault Endpoints
router.post('/cv', authMiddleware, upload.single('file'), AuthController.uploadCV);
router.delete('/cv/:id', authMiddleware, AuthController.deleteCV);

export default router;
