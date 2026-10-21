import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Other'],
    required: true
  },
  bannerImage: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  overview: { type: String, default: '' },
  keyFeatures: [{ type: String }],
  installation: { type: String, default: '' },
  directoryStructure: { type: String, default: '' },
  sections: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    order: { type: Number, default: 0 }
  }],
  resources: [{
    title: { type: String },
    url: { type: String }
  }],
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Index tối ưu: tăng tốc truy vấn danh sách tài liệu theo trạng thái + thứ tự, và tìm kiếm theo tên/tag
studyMaterialSchema.index({ isPublished: 1, order: 1, createdAt: -1 });
studyMaterialSchema.index({ slug: 1, isPublished: 1 });
studyMaterialSchema.index({ category: 1, isPublished: 1 });

export const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
