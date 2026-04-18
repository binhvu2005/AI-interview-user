import { Router } from 'express';
import * as InterviewController from '../controllers/interview.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/save', authMiddleware, InterviewController.saveAndEvaluateInterview);
router.get('/', authMiddleware, InterviewController.getUserInterviews);
router.get('/:id', authMiddleware, InterviewController.getInterviewResult);

export default router;
