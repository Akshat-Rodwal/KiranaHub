import { io } from 'socket.io-client';

let socket = null;

export const getSocketUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
};

export const getSocket = () => {
  if (!socket) {
    const url = getSocketUrl();
    socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('connect_error', () => {
      // Fallback polling
    });
  }

  return socket;
};

export default {
  getSocket,
  getSocketUrl,
};
