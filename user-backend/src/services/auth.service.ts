import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

if (!process.env.JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET environment variable is missing!');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (userData: any) => {
  const { fullName, email, password, phoneNumber, targetRole } = userData;
  
  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Họ và tên phải có ít nhất 2 ký tự');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error('Địa chỉ email không hợp lệ');
  }

  if (!password || password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  let user = await User.findOne({ email });
  if (user) throw new Error('User already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({
    fullName,
    email,
    password: hashedPassword,
    phoneNumber: phoneNumber || '',
    targetRole: targetRole || ''
  });

  await user.save();
  return user;
};

export const loginUser = async (credentials: any) => {
  const { email, password } = credentials;
  const user = await User.findOne({ email });
  
  if (!user) throw new Error('Invalid Credentials');
  if (user.isBlocked) throw new Error('Account is locked');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid Credentials');

  return user;
};

export const generateTokens = (userId: string) => {
  const payload = { user: { id: userId } };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) throw new Error('Refresh token is required');

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    const user = await User.findById(decoded.user.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
};
