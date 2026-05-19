import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as AIService from '../services/ai.service';
import { User } from '../models/user.model';
import Interview from '../models/Interview';

// Phase 1: CV-JD Matching Analysis
export const analyzeCVJD = async (req: AuthRequest, res: Response) => {
  try {
    const { cvData, jdText, position, level, lang } = req.body;
    const userId = req.user?.id;
    const user = await User.findById(userId);
    const isVip = user?.isVip || false;

    const result = await AIService.analyzeCVJDMatch(cvData || '', jdText, position, level, lang || 'vi', isVip);
    res.json(result);
  } catch (err: any) {
    console.error('AI Analysis Controller Error:', err.message);
    res.status(500).json({ 
      message: 'CV Analysis failed', 
      error: err.message,
      suggestion: "Please check your GROQ_API_KEY in .env or your API quota."
    });
  }
};

// Phase 2: Interview Questions Generation
export const generateQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { cvData, jdText, position, level, lang } = req.body;
    const userId = req.user?.id;
    const user = await User.findById(userId);
    const isVip = user?.isVip || false;

    // Check 3 free interviews limit first for non-VIP
    if (!isVip) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const interviewCount = await Interview.countDocuments({
        userId,
        createdAt: { $gte: startOfMonth }
      });
      
      if (interviewCount >= 3) {
        return res.status(403).json({
          message: 'Bạn đã sử dụng hết giới hạn 3 lượt phỏng vấn miễn phí trong tháng này. Hãy nâng cấp lên gói VIP để phỏng vấn không giới hạn!',
          limitExceeded: true
        });
      }
    }

    const result = await AIService.generateInterviewQuestions(cvData || '', jdText, position, level, lang || 'vi', isVip);
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
    const userId = req.user?.id;
    const user = await User.findById(userId);
    const isVip = user?.isVip || false;

    const result = await AIService.processInterviewChat(history, cvData || '', jdText, position, level, lang || 'vi', duration || '15', isVip);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Backend] Chat Error:', err.message);
    return res.status(500).json({ 
      error: true, 
      message: err.message || 'Internal Server Error' 
    });
  }
};
