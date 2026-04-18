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
    const evaluation = await AIService.evaluateInterview(messages, cvData, jdText, matchScore, lang || 'vi');

    // 2. Create Interview Document
    const newInterview = new Interview({
      userId,
      position,
      level,
      duration,
      matchScore,
      matchAnalysis,
      messages,
      evaluation
    });

    await newInterview.save();

    res.status(201).json({
      message: 'Interview saved and evaluated successfully',
      interviewId: newInterview._id,
      evaluation: newInterview.evaluation
    });
  } catch (err: any) {
    console.error('[Evaluation Error]:', err.message);
    res.status(500).json({ message: 'Failed to evaluate interview', error: err.message });
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
