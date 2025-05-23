// src/types/express.d.ts
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string; username: string; email: string };
    }
  }
}
