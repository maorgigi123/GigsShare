import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createResponse } from '../utils/responseHelper';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
        console.log('no token')
        return next(new Error(JSON.stringify(createResponse(null, true, 'No token provided', 401))));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      username: string;
      email: string;
    };
     socket.user = decoded; // ⬅️ אם הגדרת הרחבה ל־Socket
    next();
  } catch (err: any) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(new Error(JSON.stringify(createResponse(null, true, message, 403))));
  }
};
