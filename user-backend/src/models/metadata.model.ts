import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['position', 'level'], required: true },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index tối ưu: tăng tốc lọc metadata theo loại (position / level)
metadataSchema.index({ type: 1 });

export const Metadata = mongoose.models.Metadata || mongoose.model('Metadata', metadataSchema);
export default Metadata;
