import mongoose, { Schema, Document } from 'mongoose';

export interface IJD extends Document {
  title: string;
  content: string;
  position: string;
  level: string;
  createdAt: Date;
}

const JDSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  position: { type: String, required: true },
  level: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const JD = mongoose.models.JD || mongoose.model<IJD>('JD', JDSchema);
export default JD;
