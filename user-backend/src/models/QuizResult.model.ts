import mongoose from 'mongoose';

const quizHighScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tag: { type: String, required: true },
  highestScore: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  lastAttemptAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound unique index: one record per user per tag
quizHighScoreSchema.index({ userId: 1, tag: 1 }, { unique: true });

export const QuizHighScore = mongoose.models.QuizHighScore || mongoose.model('QuizHighScore', quizHighScoreSchema);
export default QuizHighScore;
