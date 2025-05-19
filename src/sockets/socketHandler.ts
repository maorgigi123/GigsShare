import { Server, Socket } from 'socket.io';
import { handleDisconnect } from '../controllers/socketController';

export const registerSocketHandlers = (socket: Socket, io: Server) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => handleDisconnect(socket));

  socket.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
});
};
