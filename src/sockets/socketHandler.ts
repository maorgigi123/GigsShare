import { Server, Socket } from 'socket.io';
import { handleDisconnect, handleUpdateLocation } from '../controllers/socketController';
import { withSocketAuth } from '../utils/socketAuthGuard';

export const registerSocketHandlers = (socket: Socket, io: Server) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => handleDisconnect(socket));

  socket.on('updateLocation', withSocketAuth(socket, (socket, data) => {
    handleUpdateLocation(socket, data);
  }));

  socket.on('chatMessage', withSocketAuth(socket, (socket, message) => {
    console.log(socket.user?.username)
    console.log('✅ Authenticated message:', message);
  }));
};
