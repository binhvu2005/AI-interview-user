import mongoose from 'mongoose';

// Server-side record of a live interview. The transcript the evaluation grades comes from here, never
// from the client, and the monthly free quota counts sessions at creation time.
export const SESSION_STATUSES = ['in_progress', 'evaluating', 'evaluation_failed', 'completed'] as const;
export type SessionStatus = typeof SESSION_STATUSES[number];

const InterviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: Number, required: true },
  lang: { type: String, default: 'vi' },
  cvData: { type: String, default: '' },
  // Compact profile produced by the CV analysis; used instead of the raw CV when the raw CV does not fit the prompt budget.
  cvProfile: { type: String, default: '' },
  jdText: { type: String, default: '' },
  matchScore: { type: Number, default: 0 },
  matchAnalysis: { type: String, default: '' },
  interviewPlan: { type: String, default: '' },
  plannedTopics: [{
    _id: false,
    phase: { type: String, enum: ['theory', 'practice', 'debug'] },
    topic: { type: String },
    focus: { type: String },
  }],

  messages: [{
    _id: false,
    role: { type: String, enum: ['ai', 'user'], required: true },
    // Interviewer turns: the question only. Feedback on the previous answer is kept apart so the
    // evaluation grades answers against the full question, not a question cut short by the feedback.
    content: { type: String, default: '' },
    feedback: { type: String },
    questionType: { type: String, enum: ['intro', 'main', 'probe', 'clarify', 'closing'] },
    topic: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],

  status: { type: String, enum: SESSION_STATUSES, default: 'in_progress' },
  chatClosed: { type: Boolean, default: false },
  // Set while a chat turn is being generated, so two concurrent requests cannot interleave turns.
  busyUntil: { type: Date },
  cheatCount: { type: Number, default: 0 },
  evaluationStartedAt: { type: Date },
  evaluationError: { type: String },
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

InterviewSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('InterviewSession', InterviewSessionSchema);
