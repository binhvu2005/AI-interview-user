import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api.config';

// The socket URL should be the same as API_BASE_URL but without the /api suffix if it exists
const socketUrl = API_BASE_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(socketUrl, {
        transports: ['websocket'],
      });
    }
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
