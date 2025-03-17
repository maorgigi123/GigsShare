import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { authenticateToken } from "../middleware/authMiddleware";
import { createResponse } from "../utils/responseHelper";
import { generateRefreshToken, generateToken } from "../utils/tokenHelper";
import { Request, Response } from "express";
import Listing from "../models/Listing";

// **📌 LOGOUT - התנתקות**
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.status(200).json(createResponse(null, false, "User logged out successfully", 0));
  } catch (error) {
    res.status(500).json(createResponse(null, true, "Logout failed", 500));
  }
};

// **📌 GET USER PROFILE - קבלת פרטי המשתמש המחובר**
export const getUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(400).json(createResponse(null, true, "User not found", 400));
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json(createResponse(null, true, "User not found", 404));
    }

    res.json(createResponse(user));
  } catch (error) {
    res.status(500).json(createResponse(null, true, "Failed to fetch user profile", 500));
  }
};

// **📌 REFRESH TOKEN - רענון טוקן**
export const refreshToken = async (req: Request, res: Response) : Promise<any> => {
  const { refreshToken } = req.body;
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "";

  if (!refreshToken) {
    return res.status(400).json(createResponse(null, true, "No refresh token provided", 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json(createResponse(null, true, "User not found", 401));
    }
    console.log('refresh Token')
    // Generate new access & refresh tokens
    const newToken = generateToken(user._id.toString(), user.username);
    const newRefreshToken = generateRefreshToken(user._id.toString());
    
    return res.status(200).json(createResponse({ token: newToken, refreshToken: newRefreshToken }, false, "Token refreshed", 0));
  } catch (error) {
    console.error('refresh Token Failed')
    return res.status(403).json(createResponse(null, true, "Invalid refresh token", 403));
  }
};

export const getPaginatedListings = async (req: Request, res: Response): Promise<void> => {
    try {
      let { page = "1", limit = "10" } = req.query;
  
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;
  
      const listings = await Listing.find()
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "username email"); // Populating owner details
  
      const totalListings = await Listing.countDocuments();
      const totalPages = Math.ceil(totalListings / limitNumber);
      res.status(200).json(
        createResponse(
          { listings, currentPage: pageNumber, totalPages, totalListings },
          false,
          "Listings fetched successfully",
          0
        )
      );
    } catch (error) {
      res.status(500).json(createResponse(null, true, "Failed to fetch listings", 500));
    }
  };

  