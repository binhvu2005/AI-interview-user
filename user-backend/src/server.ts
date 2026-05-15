import app from './app';
import connectDB from './config/db';
import http from 'http';
import { Server } from 'socket.io';
import { setupInterviewSockets } from './sockets/interview.socket';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this for production
    methods: ["GET", "POST"]
  }
});

setupInterviewSockets(io);

// Connect to Database
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`User Backend Server (with Sockets) running on port ${PORT}`);
  });
});