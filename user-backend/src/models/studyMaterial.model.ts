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

export const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
