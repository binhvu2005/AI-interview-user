import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: Number, required: true },
  matchScore: { type: Number, required: true }, // Độ match CV-JD ban đầu
  matchAnalysis: { type: String },
  
  messages: [{
    role: { type: String, enum: ['ai', 'user'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],

  evaluation: {
    totalScore: { type: Number },
    summary: { type: String },
    pros: [{ type: String }],
    cons: [{ type: String }],
    improvements: [{ type: String }],
    detailedFeedback: [{
      question: { type: String },
      answer: { type: String },
      score: { type: Number },
      status: { type: String, enum: ['correct', 'partially_correct', 'incorrect', 'skipped'] },
      correctReview: { type: String }, // AI gợi ý cách trả lời đúng
      feedback: { type: String }
    }]
  },
  
  isPublic: { type: Boolean, default: false }, // Cho phép hiển thị trên Showcase
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Interview', InterviewSchema);
