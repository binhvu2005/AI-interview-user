import { Server, Socket } from 'socket.io';

export const setupNotificationSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Join a room specific to the user ID to receive personal notifications
    socket.on('join_notifications', (userId: string) => {
      if (userId) {
        socket.join(`notifications_${userId}`);
        // console.log(`User ${userId} joined notification room`);
      }
    });

    socket.on('disconnect', () => {
      // console.log('Socket disconnected from notification handler');
    });
  });
};

// Utility to send notification via socket
export const sendRealtimeNotification = (io: Server, userId: string, notification: any) => {
  io.to(`notifications_${userId}`).emit('new_notification', notification);
};
