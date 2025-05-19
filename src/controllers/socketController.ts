import { Socket } from 'socket.io';

export const handleDisconnect = (socket: Socket) => {
  console.log(`Client disconnected: ${socket.id}`);
};
