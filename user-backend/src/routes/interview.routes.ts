import { Router } from 'express';
import * as InterviewController from '../controllers/interview.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/save', authMiddleware, InterviewController.saveAndEvaluateInterview);
router.get('/showcase', InterviewController.getShowcaseInterviews); // Showcase route
router.get('/', authMiddleware, InterviewController.getUserInterviews);
router.patch('/:id/share', authMiddleware, InterviewController.toggleShareInterview); // Share route
router.get('/:id', authMiddleware, InterviewController.getInterviewResult);

export default router;
