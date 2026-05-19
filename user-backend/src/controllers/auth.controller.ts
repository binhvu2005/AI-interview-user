import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import * as AuthService from '../services/auth.service';
import * as CVService from '../services/cv.service';
import { User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import * as EmailService from '../services/email.service';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateRandomPassword = (length: number = 10) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const register = async (req: any, res: Response) => {
  try {
    const user = await AuthService.registerUser(req.body);
    const tokens = AuthService.generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user.id, fullName: user.fullName, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: any, res: Response) => {
  try {
    const user = await AuthService.loginUser(req.body);
    const tokens = AuthService.generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user.id, fullName: user.fullName, email: user.email, avatar: user.avatar, isVip: (user as any).isVip } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    // Sử dụng access_token để lấy thông tin user từ Google API
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!googleRes.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }
    
    const payload = await googleRes.json();
    const { email, name, picture, sub } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = await bcrypt.hash(generateRandomPassword(16), 10);
      user = new User({
        email,
        fullName: name,
        avatar: picture,
        password: randomPassword,
        googleId: sub,
        isVip: false
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = sub;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    const tokens = AuthService.generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user.id, fullName: user.fullName, email: user.email, avatar: user.avatar, isVip: (user as any).isVip } });
  } catch (err: any) {
    console.error('Google login error:', err);
    res.status(400).json({ message: 'Google authentication failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    res.json(user);
  } catch (err: any) {
    res.status(500).send('Server Error');
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phoneNumber, targetRole, bio, avatar, emailNotifications } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (emailNotifications !== undefined) {
      if (user.isVip) {
        user.emailNotifications = emailNotifications;
      }
    }

    await user.save();
    res.json(user);
  } catch (err: any) {
    res.status(500).send('Server Error');
  }
};

export const uploadCV = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const savedCVs = await CVService.processAndSaveCV(req.user.id, req.file, req.body.name);
    res.json(savedCVs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCV = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const savedCVs = await CVService.deleteUserCV(req.user.id, req.params.id as string);
    res.json(savedCVs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshAccessToken(refreshToken);
    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB (upsert)
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // TODO: Update EmailService to send OTP instead of new password
    const emailSent = await EmailService.sendForgotPassword(email, otpCode);
    
    if (emailSent) {
      res.json({ message: 'Mã OTP đã được gửi đến email của bạn' });
    } else {
      res.status(500).json({ message: 'Lỗi khi gửi email, vui lòng thử lại sau' });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP' });

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: 'Quá số lần thử. Mã OTP đã bị vô hiệu hóa.' });
      }

      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    res.json({ message: 'Xác thực OTP thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Thiếu thông tin yêu cầu' });

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: 'Quá số lần thử. Mã OTP đã bị vô hiệu hóa.' });
      }

      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Xóa OTP sau khi dùng thành công
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
