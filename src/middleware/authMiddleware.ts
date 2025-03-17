import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createResponse, IResponse } from '../utils/responseHelper';


export const authenticateToken = async (
  req: Request, 
  res: Response<any>,  
  next: NextFunction
): Promise<any> => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    console.log('token is null')
    return res.status(401).json(createResponse(null, true, "Access Denied: No token provided", 401));
  }

  try {
    // Decode the token and add user data to the request object
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, username: string, email: string };

    // Attach decoded user info to request object
    req.user = decoded;  // `req.user` is now typed correctly

    // Call next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(createResponse(null, true, "Token expired", 401));
    }
    return res.status(403).json(createResponse(null, true, "Invalid token", 403));
  }
  
};