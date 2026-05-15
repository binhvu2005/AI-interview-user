import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  LIKE = 'LIKE',
  REPLY = 'REPLY',
  INTERVIEW_COMPLETE = 'INTERVIEW_COMPLETE',
  SYSTEM = 'SYSTEM'
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link: string; // e.g. /forum/postId, /results/interviewId
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
