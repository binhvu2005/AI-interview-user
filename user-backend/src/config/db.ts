import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interview';
    await mongoose.connect(mongoURI);
    console.log(`[DB] Connected to: ${mongoose.connection.host}`);
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
