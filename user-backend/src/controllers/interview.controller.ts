import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Interview from '../models/Interview';
import * as AIService from '../services/ai.service';

export const saveAndEvaluateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      position, 
      level, 
      duration, 
      matchScore, 
      matchAnalysis, 
      messages,
      cvData,
      jdText,
      lang
    } = req.body;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // 1. Get AI Evaluation
    console.log('[Evaluation] Starting AI analysis...');
    const userMessages = messages.filter((m: any) => m.role === 'user');
    let evaluation;
    
    if (userMessages.length === 0) {
      console.log('[Evaluation] No user messages found, skipping AI evaluation to prevent hallucination.');
      evaluation = {
        totalScore: 0,
        decision: "REJECT",
        breakdown: { technical: 0, problemSolving: 0, coding: 0, communication: 0, architectureAndFit: 0 },
        summary: lang === 'vi' ? "Ứng viên đã kết thúc phỏng vấn sớm mà không có bất kỳ tương tác nào." : "The candidate ended the interview early without any interaction.",
        pros: [lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data"],
        cons: [lang === 'vi' ? "Từ bỏ phỏng vấn" : "Abandoned interview", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data"],
        improvements: [lang === 'vi' ? "Cần hoàn thành bài phỏng vấn để hệ thống có thể đánh giá" : "Need to complete the interview for evaluation", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data", lang === 'vi' ? "Không có dữ liệu" : "No data"],
        detailedFeedback: []
      };
    } else {
      evaluation = await AIService.evaluateInterview(messages, cvData, jdText, matchScore, lang || 'vi', position, level);
    }

    // 2. Validate and Clean Data
    const sanitizedMatchScore = isNaN(parseInt(matchScore)) ? 0 : parseInt(matchScore);
    const sanitizedDuration = isNaN(parseInt(duration)) ? 15 : parseInt(duration);

    // 3. Create Interview Document
    const newInterview = new Interview({
      userId,
      position,
      level,
      duration: sanitizedDuration,
      matchScore: sanitizedMatchScore,
      matchAnalysis,
      messages,
      evaluation
    });

    console.log('[Evaluation] Saving interview to database...');
    await newInterview.save();

    res.status(201).json({
      message: 'Interview saved and evaluated successfully',
      interviewId: newInterview._id,
      evaluation: newInterview.evaluation
    });
  } catch (err: any) {
    console.error('[Evaluation Error Detailed]:', {
      message: err.message,
      stack: err.stack,
      body: req.body ? 'Present' : 'Missing'
    });
    res.status(500).json({ 
      message: 'Failed to evaluate or save interview', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getInterviewResult = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id.length < 24) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }
    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json(interview);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getUserInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const interviews = await Interview.find({ userId })
      .select('position level matchScore evaluation.totalScore createdAt')
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
