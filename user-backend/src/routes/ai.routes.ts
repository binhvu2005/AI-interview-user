import { Router } from 'express';
import * as AIController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { analyzeLimiter, chatLimiter, extractLimiter, planLimiter } from '../middlewares/ai-rate-limit.middleware';
import { cvUpload } from '../middlewares/cv-upload.middleware';

const router = Router();

router.post('/extract-cv', authMiddleware, extractLimiter, cvUpload.single('file'), AIController.extractCV);
router.post('/analyze-cv', authMiddleware, analyzeLimiter, AIController.analyzeCVJD);
router.post('/generate-questions', authMiddleware, planLimiter, AIController.generateQuestions);
router.post('/chat', authMiddleware, chatLimiter, AIController.chatWithAI);

export default router;
