import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as AIService from '../services/ai.service';
import * as CVService from '../services/cv.service';
import { User } from '../models/user.model';
import InterviewSession from '../models/InterviewSession';
import { checkAndUpdateVipStatus } from '../utils/vip';
import { FREE_INTERVIEWS_PER_MONTH, countInterviewsThisMonth } from '../utils/interview-quota';
import { clamp } from '../utils/evaluation-score';

const MAX_CV_CHARS = 30_000;
const MAX_JD_CHARS = 15_000;
const MAX_ANSWER_CHARS = 4_000;
// A session cannot be reused indefinitely: chat closes this long after the planned duration.
const SESSION_GRACE_MS = 30 * 60 * 1000;
// Lock held while one chat turn is generated; long enough for a slow Gemini call plus a Groq fallback.
const CHAT_LOCK_MS = 3 * 60 * 1000;

// Same text the client shows from i18n (interview.welcome), stored as the first interviewer turn.
const WELCOME = {
  vi: 'Chào mừng bạn đến với buổi phỏng vấn giả định. Tôi là Obsidian AI. Hãy giới thiệu ngắn gọn về bản thân bạn.',
  en: 'Welcome to your mock interview. I am Obsidian AI. Please introduce yourself briefly.',
};

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');
const langOf = (value: unknown) => (typeof value === 'string' && value.startsWith('vi') ? 'vi' : 'en');

const getVip = async (userId?: string) => {
  const user = await User.findById(userId);
  return user ? await checkAndUpdateVipStatus(user) : false;
};

// Below this the PDF has no text layer (a scan or a photo): analysing it would only produce
// "the CV cannot be read" while still spending an AI call.
const MIN_CV_TEXT_CHARS = 50;

// Turns an uploaded CV file into text without saving it. The browser cannot read a PDF's text itself.
export const extractCV = async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No CV file uploaded' });
  try {
    const content = (await CVService.extractCVText(req.file)).trim();
    if (content.length < MIN_CV_TEXT_CHARS) {
      return res.status(422).json({
        message: 'Không đọc được chữ trong CV (có thể là PDF dạng ảnh/scan). Hãy dùng PDF xuất từ Word/Google Docs hoặc lưu CV vào Vault dưới dạng văn bản.',
      });
    }
    res.json({ text: content.slice(0, MAX_CV_CHARS) });
  } catch (err: any) {
    console.error('CV extraction error:', err.message);
    res.status(422).json({ message: 'Không đọc được file PDF này. Hãy thử xuất lại CV sang PDF rồi tải lên.' });
  }
};

// Phase 1: CV-JD Matching Analysis
export const analyzeCVJD = async (req: AuthRequest, res: Response) => {
  try {
    const { cvData, jdText, position, level, lang } = req.body;
    const isVip = await getVip(req.user?.id);

    const result = await AIService.analyzeCVJDMatch(
      text(cvData, MAX_CV_CHARS), text(jdText, MAX_JD_CHARS), position, level, lang || 'vi', isVip,
    );
    res.json(result);
  } catch (err: any) {
    console.error('AI Analysis Controller Error:', err.message);
    res.status(500).json({ message: 'CV Analysis failed' });
  }
};

// Phase 2: plan the interview and open its session. The session is what counts against the free quota,
// and every later chat turn and the evaluation work from the transcript stored in it.
export const generateQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { cvData, cvProfile, jdText, position, level, lang, duration, matchScore, matchAnalysis, quickTest } = req.body;
    const userId = req.user?.id;
    const isVip = await getVip(userId);

    if (!isVip && (await countInterviewsThisMonth(userId)) >= FREE_INTERVIEWS_PER_MONTH) {
      return res.status(403).json({
        message: 'Bạn đã sử dụng hết giới hạn 3 lượt phỏng vấn miễn phí trong tháng này. Hãy nâng cấp lên gói VIP để phỏng vấn không giới hạn!',
        limitExceeded: true
      });
    }

    const ctx: AIService.CandidateContext = {
      cvData: text(cvData, MAX_CV_CHARS),
      cvProfile: text(cvProfile, 1500),
      jdText: text(jdText, MAX_JD_CHARS),
      position: text(position, 200) || 'Software Engineer',
      level: text(level, 100) || 'Mid',
      lang: langOf(lang),
      isVip,
    };
    const minutes = Math.round(clamp(parseInt(duration) || 15, 5, 120));

    // Developer shortcut: skips the planning call only; chat and evaluation still use the real AI.
    const skipPlanning = quickTest === true && process.env.ALLOW_QUICK_TEST === 'true';
    const plan = skipPlanning
      ? { interviewPlan: 'Quick test', topics: [] }
      : await AIService.generateInterviewQuestions(ctx, minutes);

    const session = await InterviewSession.create({
      userId,
      position: ctx.position,
      level: ctx.level,
      duration: minutes,
      lang: ctx.lang,
      cvData: ctx.cvData,
      cvProfile: ctx.cvProfile,
      jdText: ctx.jdText,
      matchScore: Math.round(clamp(matchScore, 0, 100)),
      matchAnalysis: text(matchAnalysis, 5000),
      interviewPlan: plan.interviewPlan,
      plannedTopics: plan.topics,
      messages: [{ role: 'ai', content: WELCOME[ctx.lang as 'vi' | 'en'], questionType: 'intro' }],
      expiresAt: new Date(Date.now() + minutes * 60 * 1000 + SESSION_GRACE_MS),
    });

    res.json({ ...plan, sessionId: session._id });
  } catch (err: any) {
    console.error('AI Interview Controller Error:', err.message);
    res.status(500).json({ message: 'Interview generation failed' });
  }
};

// Phase 3: Live Interview Chat. The client sends only its latest answer; the transcript is the session's.
export const chatWithAI = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { sessionId } = req.body;
  const answer = text(req.body.message, MAX_ANSWER_CHARS).trim();
  if (!sessionId || !answer) return res.status(400).json({ message: 'sessionId and message are required' });

  const now = new Date();
  let locked: any = null;
  try {
    locked = await InterviewSession.findOneAndUpdate(
      {
        _id: sessionId, userId, status: 'in_progress', chatClosed: false, expiresAt: { $gt: now },
        $or: [{ busyUntil: null }, { busyUntil: { $lt: now } }],
      },
      { $set: { busyUntil: new Date(now.getTime() + CHAT_LOCK_MS) } },
      { returnDocument: 'after' },
    );
  } catch {
    return res.status(400).json({ message: 'Invalid session' });
  }

  if (!locked) {
    const session = await InterviewSession.findOne({ _id: sessionId, userId }).select('status chatClosed expiresAt busyUntil');
    if (!session) return res.status(404).json({ message: 'Interview session not found' });
    if (session.busyUntil && session.busyUntil > now) return res.status(409).json({ message: 'The previous answer is still being processed' });
    return res.status(409).json({ message: 'This interview has ended', interviewEnded: true });
  }

  try {
    const isVip = await getVip(userId);
    const history = [...locked.messages.map((m: any) => m.toObject()), { role: 'user', content: answer }];
    const result = await AIService.processInterviewChat(
      history,
      { cvData: locked.cvData, cvProfile: locked.cvProfile, jdText: locked.jdText, position: locked.position, level: locked.level, lang: locked.lang, isVip },
      locked.duration,
      locked.plannedTopics,
    );

    // The answer is stored only together with the reply: after a failed turn the client resends it.
    await InterviewSession.updateOne({ _id: locked._id }, {
      $push: {
        messages: {
          $each: [
            { role: 'user', content: answer },
            { role: 'ai', content: result.nextQuestion, feedback: result.feedback, questionType: result.questionType, topic: result.topic },
          ],
        },
      },
      $set: { busyUntil: null, chatClosed: result.isFinished },
    });
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Backend] Chat Error:', err.message);
    await InterviewSession.updateOne({ _id: locked._id }, { $set: { busyUntil: null } }).catch(() => {});
    return res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};
