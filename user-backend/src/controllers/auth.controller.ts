import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import * as AuthService from '../services/auth.service';
import * as CVService from '../services/cv.service';
import { User } from '../models/user.model';
import * as EmailService from '../services/email.service';

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

    const newPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    const emailSent = await EmailService.sendForgotPassword(email, newPassword);
    
    if (emailSent) {
      res.json({ message: 'Mật khẩu mới đã được gửi đến email của bạn' });
    } else {
      res.status(500).json({ message: 'Lỗi khi gửi email, vui lòng thử lại sau' });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
