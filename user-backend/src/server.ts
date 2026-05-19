import app from './app';
import connectDB from './config/db';
import http from 'http';
import { Server } from 'socket.io';
import { setupInterviewSockets } from './sockets/interview.socket';
import { setupNotificationSockets } from './sockets/notification.socket';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const allowedOrigins = [
  'https://ai-interview.id.vn',
  'https://www.ai-interview.id.vn',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

setupInterviewSockets(io);
setupNotificationSockets(io);

// Connect to Database
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`User Backend Server (with Sockets) running on port ${PORT}`);
  });
});