import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Tự động xóa sau 5 phút (300 giây)
});

export const Otp = mongoose.model('Otp', OtpSchema);
export default Otp;
