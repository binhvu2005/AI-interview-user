import { Router } from 'express';
import * as AIController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/analyze-cv', authMiddleware, AIController.analyzeCVJD);
router.post('/generate-questions', authMiddleware, AIController.generateQuestions);
router.post('/chat', authMiddleware, AIController.chatWithAI);

export default router;
