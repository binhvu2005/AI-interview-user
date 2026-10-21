import rateLimit from 'express-rate-limit';
import { AuthRequest } from './auth.middleware';

// Every AI call spends the shared Groq/Gemini quota, so limits are per account (after authMiddleware),
// not per IP: one user scripting /ai/chat must not cause 429s for everyone else.
const perUser = (windowMs: number, limit: number, message: string) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: req => `user:${(req as AuthRequest).user?.id ?? 'anonymous'}`,
  message: { message },
});

// A live answer takes the candidate well over 10 seconds to write.
export const chatLimiter = perUser(60 * 1000, 6, 'Too many interview messages, please slow down.');
export const analyzeLimiter = perUser(60 * 60 * 1000, 15, 'Too many CV analyses this hour, please try again later.');
// No AI call, but PDF parsing is CPU work on the API process.
export const extractLimiter = perUser(60 * 60 * 1000, 30, 'Too many CV uploads this hour, please try again later.');
export const planLimiter = perUser(60 * 60 * 1000, 10, 'Too many interviews started this hour, please try again later.');
