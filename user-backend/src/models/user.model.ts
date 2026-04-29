import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isBlocked: { type: Boolean, default: false },
  isVip: { type: Boolean, default: false },
  savedCVs: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    content: { type: String, default: '' },
    pdfData: { type: String, default: '' },
    uploadDate: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export default User;
