import { Router } from 'express';
import * as AIController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { analyzeLimiter, chatLimiter, planLimiter } from '../middlewares/ai-rate-limit.middleware';

const router = Router();

router.post('/analyze-cv', authMiddleware, analyzeLimiter, AIController.analyzeCVJD);
router.post('/generate-questions', authMiddleware, planLimiter, AIController.generateQuestions);
router.post('/chat', authMiddleware, chatLimiter, AIController.chatWithAI);

export default router;
