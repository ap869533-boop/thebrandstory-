import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

let io: Server;

export function initSocket(server: http.Server, allowedOrigins: string[]) {
  io = new Server(server, {
    path: '/api/socket.io/',
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-12345') as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    // Join a room specific to this user so we can emit events directly to them
    socket.join(`user_${userId}`);
    console.log(`🔌 Socket connected for user: ${userId}`);

    socket.on('typing', (data: { conversationId: string; receiverId: string }) => {
      // Emit typing event to the receiver
      socket.to(`user_${data.receiverId}`).emit('peer_typing', {
        conversationId: data.conversationId,
        senderId: userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected for user: ${userId}`);
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}
