import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true }
}, { timestamps: true });

export const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;
