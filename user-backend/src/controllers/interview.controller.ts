import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';
import Interview from '../models/Interview';
import InterviewSession from '../models/InterviewSession';
import { User } from '../models/user.model';
import { checkAndUpdateVipStatus } from '../utils/vip';
import * as AIService from '../services/ai.service';
import * as EmailService from '../services/email.service';
import { createNotification } from '../services/notification.service';
import { NotificationType } from '../models/Notification.model';

// An evaluation still marked running after this long died with the process; it may be started again.
const EVALUATION_STALE_MS = 10 * 60 * 1000;

const noAnswerEvaluation = (lang: string) => {
  const vi = lang === 'vi';
  const noData = vi ? "Không có dữ liệu" : "No data";
  return {
    totalScore: 0,
    decision: "REJECT",
    breakdown: { technical: 0, problemSolving: 0, coding: 0, communication: 0, architectureAndFit: 0 },
    summary: vi ? "Ứng viên đã kết thúc phỏng vấn sớm mà không có bất kỳ tương tác nào." : "The candidate ended the interview early without any interaction.",
    pros: [noData, noData, noData, noData, noData],
    cons: [vi ? "Từ bỏ phỏng vấn" : "Abandoned interview", noData, noData, noData, noData],
    improvements: [vi ? "Cần hoàn thành bài phỏng vấn để hệ thống có thể đánh giá" : "Need to complete the interview for evaluation", noData, noData, noData, noData],
    detailedFeedback: []
  };
};

// The result page shows the transcript as the candidate saw it: feedback, then the next question.
const displayMessages = (messages: any[]) =>
  messages
    .filter(m => m.role === 'user' || m.content || m.feedback)
    .map(m => ({
      role: m.role,
      content: m.role === 'ai' && m.feedback ? [m.feedback, m.content].filter(Boolean).join('\n\n') : m.content,
      timestamp: m.timestamp,
    }));

const runEvaluation = async (session: any) => {
  try {
    const user = await User.findById(session.userId);
    const isVip = user ? await checkAndUpdateVipStatus(user) : false;
    const messages = session.messages.map((m: any) => m.toObject());

    console.log(`[Evaluation] Session ${session._id}: starting AI analysis...`);
    const evaluation = await AIService.evaluateInterview(messages, {
      cvData: session.cvData, cvProfile: session.cvProfile, jdText: session.jdText, position: session.position,
      level: session.level, lang: session.lang, isVip, duration: session.duration, matchScore: session.matchScore,
    }, session.cheatCount) ?? noAnswerEvaluation(session.lang);

    // A stale run restarted by the client may race the original one; only one Interview per session.
    let interview = await Interview.findOne({ sessionId: session._id });
    if (!interview) {
      interview = await Interview.create({
        userId: session.userId,
        sessionId: session._id,
        position: session.position,
        level: session.level,
        duration: session.duration,
        matchScore: session.matchScore,
        matchAnalysis: session.matchAnalysis,
        messages: displayMessages(messages),
        evaluation,
      });
    }
    await InterviewSession.updateOne({ _id: session._id }, { $set: { status: 'completed', interviewId: interview._id, evaluationError: null } });

    if (user && user.email && user.isVip && user.emailNotifications) {
      EmailService.sendInterviewResult(user.email, user.fullName || 'Ứng viên', session.position, evaluation)
        .catch(err => console.error('Error sending email:', err));
    }
    await createNotification({
      recipient: session.userId,
      type: NotificationType.INTERVIEW_COMPLETE,
      title: session.lang === 'vi' ? 'Phỏng vấn hoàn tất' : 'Interview Completed',
      message: session.lang === 'vi' ? `Kết quả phỏng vấn vị trí ${session.position} đã có sẵn.` : `Interview result for ${session.position} is now available.`,
      link: `/results/${interview._id}`
    }).catch(err => console.error('Error creating notification:', err));
    return interview;
  } catch (err: any) {
    console.error(`[Evaluation] Session ${session._id} failed:`, err.message);
    await InterviewSession.updateOne({ _id: session._id }, { $set: { status: 'evaluation_failed', evaluationError: String(err.message).slice(0, 300) } });
    throw err;
  }
};

// Ends the interview and grades the transcript stored in the session; the client only names the session.
// The transcript is already saved, so a failed evaluation is retried by calling this again.
export const saveAndEvaluateInterview = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'sessionId is required' });
  // Tab switches are detected in the browser, so this stays client-reported; it can only go up.
  const reportedSwitches = Math.max(0, Math.floor(Number(req.body.cheatCount) || 0));

  let session: any;
  try {
    session = await InterviewSession.findOneAndUpdate(
      {
        _id: sessionId,
        userId,
        $or: [
          { status: { $in: ['in_progress', 'evaluation_failed'] } },
          { status: 'evaluating', evaluationStartedAt: { $lt: new Date(Date.now() - EVALUATION_STALE_MS) } },
        ],
      },
      {
        $set: { status: 'evaluating', chatClosed: true, evaluationStartedAt: new Date(), evaluationError: null },
        $max: { cheatCount: reportedSwitches },
      },
      { returnDocument: 'after' },
    );
  } catch {
    return res.status(400).json({ message: 'Invalid session' });
  }

  if (!session) {
    const existing = await InterviewSession.findOne({ _id: sessionId, userId }).select('status interviewId');
    if (!existing) return res.status(404).json({ message: 'Interview session not found' });
    if (existing.status === 'completed') return res.status(200).json({ status: 'completed', interviewId: existing.interviewId });
    return res.status(202).json({ status: existing.status, sessionId });
  }

  // Grading takes several AI calls (and may wait out rate limits), so it runs after the response;
  // the client polls the session status.
  runEvaluation(session).catch(() => {});
  return res.status(202).json({ status: 'evaluating', sessionId: session._id });
};

export const getSessionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user?.id })
      .select('status interviewId evaluationStartedAt');
    if (!session) return res.status(404).json({ message: 'Interview session not found' });
    const stale = session.status === 'evaluating'
      && (!session.evaluationStartedAt || session.evaluationStartedAt.getTime() < Date.now() - EVALUATION_STALE_MS);
    res.json({ status: stale ? 'evaluation_failed' : session.status, interviewId: session.interviewId });
  } catch {
    res.status(400).json({ message: 'Invalid session' });
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

    // Enforce strict ownership check to block IDOR attacks
    const userId = req.user?.id;
    if (interview.userId.toString() !== userId && !interview.isPublic) {
      return res.status(403).json({ message: 'Access denied. This interview result is private.' });
    }

    // Populate user profile info (fullName, avatar, isVip) for display on Results & Showcase
    await interview.populate({ path: 'userId', select: 'fullName avatar isVip' });

    // Check VIP status of the viewing user
    let isViewerVip = false;
    if (userId) {
      const viewer = await User.findById(userId);
      isViewerVip = viewer ? await checkAndUpdateVipStatus(viewer) : false;
    }

    const resultObj = interview.toObject() as any;

    // If the viewer is not VIP, redact detailed evaluation details
    if (!isViewerVip) {
      if (resultObj.evaluation) {
        resultObj.evaluation.detailedFeedback = [];
        resultObj.evaluation.improvements = [];
        resultObj.evaluation.breakdown = {
          technical: 0,
          problemSolving: 0,
          coding: 0,
          communication: 0,
          architectureAndFit: 0
        };
      }
    }

    res.json(resultObj);
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

export const toggleShareInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const interview = await Interview.findOne({ _id: id, userId });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    interview.isPublic = !interview.isPublic;
    await interview.save();

    res.json({ message: 'Cập nhật trạng thái chia sẻ thành công', isPublic: interview.isPublic });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getShowcaseInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const { position, level, page = 1, limit = 10 } = req.query;
    const query: any = { isPublic: true };
    
    if (position) query.position = position;
    if (level) query.level = level;

    const skip = (Number(page) - 1) * Number(limit);

    const interviews = await Interview.find(query)
      .select('position level duration evaluation.totalScore createdAt userId') 
      .populate({ path: 'userId', select: 'fullName targetRole avatar' }) 
      .sort({ 'evaluation.totalScore': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Interview.countDocuments(query);

    res.json({
      data: interviews,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getHeatmapData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const heatmap = await Interview.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = heatmap.map(item => ({
      date: item._id,
      count: item.count
    }));

    res.json(formattedData);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
