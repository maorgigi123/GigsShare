import './config/cloudinary';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import userRoutes from './routes/userRoutes'
import { GetSiteContent } from "./controllers/authRoutesController";
import fileUpload from 'express-fileupload';
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


const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => console.error("❌ MongoDB connection error:", error));
