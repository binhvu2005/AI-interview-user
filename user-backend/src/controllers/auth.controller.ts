import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import * as AuthService from '../services/auth.service';
import * as CVService from '../services/cv.service';
import { User } from '../models/user.model';

export const register = async (req: any, res: Response) => {
  try {
    const user = await AuthService.registerUser(req.body);
    const token = AuthService.generateToken(user.id);
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: any, res: Response) => {
  try {
    const user = await AuthService.loginUser(req.body);
    const token = AuthService.generateToken(user.id);
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, avatar: user.avatar } });
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
    const { fullName, phoneNumber, targetRole, bio, avatar } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

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
