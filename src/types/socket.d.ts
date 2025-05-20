import { JwtPayload } from "jsonwebtoken";
import "socket.io";

declare module "socket.io" {
  interface Socket {
    user?: JwtPayload & {
      id: string;
      username: string;
      email: string;
    };
  }
}
