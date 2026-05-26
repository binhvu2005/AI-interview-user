import express from 'express';
import * as QuizController from '../controllers/quiz.controller';

const router = express.Router();

// Middleware to extract userId from token (optional auth)
const optionalAuth = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.userId = decoded.id || decoded.userId;
    }
  } catch (err) {
    // Token invalid/expired - continue as unauthenticated
  }
  next();
};

router.get('/questions', QuizController.getQuizQuestions);
router.post('/submit', optionalAuth, QuizController.submitQuiz);
router.get('/high-scores', optionalAuth, QuizController.getHighScores);

export default router;
