import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  explanation: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;
