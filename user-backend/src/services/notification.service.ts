import Notification, { NotificationType } from '../models/Notification.model';
import { io } from '../server';
import { sendRealtimeNotification } from '../sockets/notification.socket';

export const createNotification = async (data: {
  recipient: string;
  sender?: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
}) => {
  try {
    // Don't notify if sender is same as recipient
    if (data.sender && data.sender.toString() === data.recipient.toString()) {
      return null;
    }

    const notification = new Notification(data);
    await notification.save();

    // Send real-time via socket
    if (io) {
      sendRealtimeNotification(io, data.recipient, notification);
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};
