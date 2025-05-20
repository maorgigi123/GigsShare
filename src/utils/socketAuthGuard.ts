import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { createResponse } from '../utils/responseHelper';

export const withSocketAuth = (
  socket: Socket,
  handler: (socket: Socket, data: any) => void
) => {
  return (data: any) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      const errorResponse = createResponse(null, true, 'No token provided', 401);
      socket.emit('auth_error', errorResponse);
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
      };

      socket.user = decoded;
      handler(socket, data);
    } catch (err: any) {
      const message =
        err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      const code = err.name === 'TokenExpiredError' ? 401 : 403;
      const errorResponse = createResponse(null, true, message, code);
      socket.emit('auth_error', errorResponse);
    }
  };
};
