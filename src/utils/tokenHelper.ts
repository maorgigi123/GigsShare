import jwt from "jsonwebtoken";

// פונקציה ליצירת JWT
export const generateToken = (userId: string, username: string) => {
  return jwt.sign({ id: userId, username }, process.env.JWT_SECRET as string, { expiresIn: "1m" });
};

// פונקציה ליצירת refreshToken (לשמירה ממושכת)
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
};