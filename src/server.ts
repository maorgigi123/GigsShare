/// <reference path="./types/socket.d.ts" />

import './config/cloudinary';
import './services/firebaseMessaging'
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import userRoutes from './routes/userRoutes'
import { GetSiteContent } from "./controllers/authRoutesController";
import fileUpload from 'express-fileupload';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './sockets/socketHandler';
import { socketAuthMiddleware } from './middleware/socketAuthMiddleware';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/ContentManagement/GetSiteContent", GetSiteContent);

// יצירת שרת HTTP
const httpServer = createServer(app);

// חיבור socket.io לשרת
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.use(socketAuthMiddleware);
io.on('connection', (socket) => {
  registerSocketHandlers(socket, io);
});


// חיבור למסד נתונים והפעלת השרת
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => console.error("❌ MongoDB connection error:", error));
