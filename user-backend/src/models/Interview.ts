import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Session the transcript was recorded in; absent on interviews saved before sessions existed.
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession' },
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
    decision: { type: String },
    breakdown: {
      technical: { type: Number },
      problemSolving: { type: Number },
      coding: { type: Number },
      communication: { type: Number },
      architectureAndFit: { type: Number }
    },
    integrity: {
      tabSwitches: { type: Number },
      flagged: { type: Boolean },
      penalty: { type: Number }
    },
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

// Index tối ưu: tăng tốc truy vấn lịch sử phỏng vấn của user, showcase công khai, và sắp xếp theo ngày
InterviewSchema.index({ userId: 1, createdAt: -1 });
InterviewSchema.index({ isPublic: 1, 'evaluation.totalScore': -1, createdAt: -1 });
InterviewSchema.index({ userId: 1, createdAt: 1 }); // Cho heatmap aggregate

export default mongoose.model('Interview', InterviewSchema);
