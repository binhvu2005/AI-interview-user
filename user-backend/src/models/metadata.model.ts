import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['position', 'level'], required: true },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

export const Metadata = mongoose.models.Metadata || mongoose.model('Metadata', metadataSchema);
export default Metadata;
