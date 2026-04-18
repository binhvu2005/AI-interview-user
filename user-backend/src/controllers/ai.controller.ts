import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as AIService from '../services/ai.service';

// Phase 1: CV-JD Matching Analysis
export const analyzeCVJD = async (req: AuthRequest, res: Response) => {
  try {
    const { cvData, jdText, position, level, lang } = req.body;
    const result = await AIService.analyzeCVJDMatch(cvData || '', jdText, position, level, lang || 'vi');
    res.json(result);
  } catch (err: any) {
    console.error('AI Analysis Controller Error:', err.message);
    res.status(500).json({ message: 'CV Analysis failed', error: err.message });
  }
};

// Phase 2: Interview Questions Generation
export const generateQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { cvData, jdText, position, level, lang } = req.body;
    const result = await AIService.generateInterviewQuestions(cvData || '', jdText, position, level, lang || 'vi');
    res.json(result);
  } catch (err: any) {
    console.error('AI Interview Controller Error:', err.message);
    res.status(500).json({ message: 'Interview generation failed', error: err.message });
  }
};

// Phase 3: Live Interview Chat
export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { history, cvData, jdText, position, level, lang, duration } = req.body;
    const result = await AIService.processInterviewChat(history, cvData || '', jdText, position, level, lang || 'vi', duration || '15');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Backend] Chat Error:', err.message);
    return res.status(500).json({ 
      error: true, 
      message: err.message || 'Internal Server Error' 
    });
  }
};
