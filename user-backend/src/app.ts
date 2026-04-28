import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import dataRoutes from './routes/data.routes';
import interviewRoutes from './routes/interview.routes';
import forumRoutes from './routes/forum.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
// 1. Standard Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/forum', forumRoutes);

// 2. Proxy Fallback (When Nginx sends the full /api/user/api or /api/user path)
app.use('/api/user/api/auth', authRoutes);
app.use('/api/user/api/ai', aiRoutes);
app.use('/api/user/api/data', dataRoutes);
app.use('/api/user/api/interviews', interviewRoutes);
app.use('/api/user/api/forum', forumRoutes);

app.use('/api/user/auth', authRoutes);
app.use('/api/user/ai', aiRoutes);
app.use('/api/user/data', dataRoutes);
app.use('/api/user/interviews', interviewRoutes);
app.use('/api/user/forum', forumRoutes);

// 3. Simple Fallback (When Nginx strips /api but keep /auth)
app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);
app.use('/data', dataRoutes);
app.use('/interviews', interviewRoutes);
app.use('/forum', forumRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
