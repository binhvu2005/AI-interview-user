import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import dataRoutes from './routes/data.routes';
import interviewRoutes from './routes/interview.routes';
import forumRoutes from './routes/forum.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  'https://ai-interview.id.vn',
  'https://www.ai-interview.id.vn',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many authentication or OTP attempts, please try again after 15 minutes.' }
});

// Apply rate limit to all /api requests
app.use('/api', apiLimiter);

// Apply strict rate limiting to sensitive authentication endpoints
const authRoutesToLimit = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/verify-otp',
  '/api/auth/reset-password',
  '/api/user/api/auth/login',
  '/api/user/api/auth/register',
  '/api/user/api/auth/forgot-password',
  '/api/user/api/auth/verify-otp',
  '/api/user/api/auth/reset-password',
  '/api/user/auth/login',
  '/api/user/auth/register',
  '/api/user/auth/forgot-password',
  '/api/user/auth/verify-otp',
  '/api/user/auth/reset-password',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password'
];
app.use(authRoutesToLimit, authLimiter);

// Routes
// 1. Standard Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);

// 2. Proxy Fallback (When Nginx sends the full /api/user/api or /api/user path)
app.use('/api/user/api/auth', authRoutes);
app.use('/api/user/api/ai', aiRoutes);
app.use('/api/user/api/data', dataRoutes);
app.use('/api/user/api/interviews', interviewRoutes);
app.use('/api/user/api/forum', forumRoutes);
app.use('/api/user/api/notifications', notificationRoutes);

app.use('/api/user/auth', authRoutes);
app.use('/api/user/ai', aiRoutes);
app.use('/api/user/data', dataRoutes);
app.use('/api/user/interviews', interviewRoutes);
app.use('/api/user/forum', forumRoutes);
app.use('/api/user/notifications', notificationRoutes);

// 3. Simple Fallback (When Nginx strips /api but keep /auth)
app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);
app.use('/data', dataRoutes);
app.use('/interviews', interviewRoutes);
app.use('/forum', forumRoutes);
app.use('/notifications', notificationRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
