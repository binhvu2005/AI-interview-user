import { Server, Socket } from 'socket.io';

export const setupInterviewSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Host creates/joins a room
    socket.on('join-room-host', (roomCode: string) => {
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.isHost = true;
      console.log(`[Socket] Host ${socket.id} joined room ${roomCode}`);
      
      // Notify host about existing spectators immediately
      socket.emit('spectator-update', getSpectatorsInRoom(io, roomCode));
    });

    // Spectator joins a room
    socket.on('join-room-spectator', ({ roomCode, name }: { roomCode: string, name: string }) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room) {
        socket.emit('error-msg', 'Phòng không tồn tại hoặc đã kết thúc.');
        return;
      }

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.name = name;
      socket.data.isHost = false;

      console.log(`[Socket] Spectator ${name} (${socket.id}) joined room ${roomCode}`);

      // Notify everyone in the room about the new spectator
      io.to(roomCode).emit('spectator-update', getSpectatorsInRoom(io, roomCode));
    });

    // WebRTC Signaling (Broadcaster <-> Spectator)
    socket.on('signal', ({ to, signal }: { to: string, signal: any }) => {
      io.to(to).emit('signal', { from: socket.id, signal });
    });

    // Kick spectator (Only Host can do this)
    socket.on('kick-spectator', (spectatorSocketId: string) => {
      if (socket.data.isHost) {
        io.to(spectatorSocketId).emit('kicked');
        const spectatorSocket = io.sockets.sockets.get(spectatorSocketId);
        if (spectatorSocket) {
          spectatorSocket.leave(socket.data.roomCode);
        }
        io.to(socket.data.roomCode).emit('spectator-update', getSpectatorsInRoom(io, socket.data.roomCode));
      }
    });

    socket.on('disconnect', () => {
      const roomCode = socket.data.roomCode;
      if (roomCode) {
        io.to(roomCode).emit('spectator-update', getSpectatorsInRoom(io, roomCode));
      }
    });
  });
};

function getSpectatorsInRoom(io: Server, roomCode: string) {
  const sockets = io.sockets.adapter.rooms.get(roomCode);
  if (!sockets) return [];

  const spectators: any[] = [];
  sockets.forEach((socketId) => {
    const s = io.sockets.sockets.get(socketId);
    if (s && !s.data.isHost) {
      spectators.push({
        socketId: s.id,
        name: s.data.name
      });
    }
  });
  return spectators;
}
