import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { authenticateToken } from "../middleware/authMiddleware";
import { createResponse } from "../utils/responseHelper";
import { generateRefreshToken, generateToken } from "../utils/tokenHelper";
import { Request, Response } from "express";
import Listing, { IListing } from "../models/Listing";
import cloudinary from '../config/cloudinary';
import { UploadedFile } from 'express-fileupload';
import mongoose from "mongoose";
import { getExchangeRates } from '../services/exchangeService';

// interface FileUploadRequest extends Request {
//   files?: {
//     images?: UploadedFile | UploadedFile[];
//   };
// }
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
  const refreshToken = req.headers['authorization']?.split(' ')[1] as string;
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
    let { page = "1", limit = "10", category, currency = "USD" } = req.query;
    const targetCurrency = (currency as string).toUpperCase();
    const exchangeRates = getExchangeRates();
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let categoryFilter: number[] = [];

    if (category) {
      if (Array.isArray(category)) {
        categoryFilter = category.map((c) => Number(c));
      } else if (typeof category === "string") {
        try {
          const parsed = JSON.parse(category);
          if (Array.isArray(parsed)) {
            categoryFilter = parsed.map((c) => Number(c));
          } else {
            categoryFilter = [Number(category)];
          }
        } catch {
          categoryFilter = [Number(category)];
        }
      }
    }

    const filter: any = {};
    if (categoryFilter.length > 0) {
      filter.categories = { $in: categoryFilter };
    }

    const listings = await Listing.find(filter)
      .skip(skip)
      .limit(limitNumber)
      .populate("owner", "username email");

    const totalListings = await Listing.countDocuments(filter);
    const totalPages = Math.ceil(totalListings / limitNumber);

    const convertedListings = listings.map((listing) => {
      const originalPrice = listing.pricePerHour;
      const originalCurrency = listing.currency || 'USD';
      let convertedPrice = originalPrice;

      if (originalCurrency !== targetCurrency) {
        const rateFrom = exchangeRates?.[originalCurrency];
        const rateTo = exchangeRates?.[targetCurrency];

        if (rateFrom && rateTo) {
          convertedPrice = (originalPrice / rateFrom) * rateTo;
        } else {
          console.warn(`⚠️ Missing exchange rate for ${originalCurrency} or ${targetCurrency}`);
        }
      }

      return {
        ...listing.toObject(),
        price: {
          original: originalPrice,
          originalCurrency,
          converted: Math.round(convertedPrice * 100) / 100,
          targetCurrency,
        },
      };
    });

    res.status(200).json(
      createResponse(
        {
          listings: convertedListings,
          currentPage: pageNumber,
          totalPages,
          totalListings,
        },
        false,
        "Listings fetched successfully",
        0
      )
    );
  } catch (error) {
    console.error("❌ getPaginatedListings error:", error);
    res.status(500).json(createResponse(null, true, "Failed to fetch listings", 500));
  }
};

export const getAllExchange = async (req: Request, res: Response): Promise<any> => {
  try{
    const exchangeRates = getExchangeRates();

    console.log(exchangeRates)
     res.status(200).json(createResponse(exchangeRates, false, "get Exchange successfully", 0));
  }catch(error){
    console.error("❌ getPaginatedListings error:", error);
    res.status(500).json(createResponse(null, true, "Failed to get Exchange", 500));
  }

}
  export const createListing = async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.user?.id) {
        return res.status(401).json(createResponse(null, true, 'Unauthorized', 401));
      }
  
      const {
        name,
        description,
        pricePerHour,
        categories,
        availability,
        cancellationPolicy,
        damagePolicy,
        logistics,
        currency
      } = req.body;
      const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
      const parsedCancellationPolicy = typeof cancellationPolicy === 'string' ? JSON.parse(cancellationPolicy) : cancellationPolicy;
      const parsedDamagePolicy = typeof damagePolicy === 'string' ? JSON.parse(damagePolicy) : damagePolicy;
      const parsedLogistics = typeof logistics === 'string' ? JSON.parse(logistics) : logistics;

      const files = req.files?.images;
      if (!files) {
        console.log('its work 3')
        return res.status(400).json(createResponse(null, true, 'No images uploaded', 400));
      }
  
      const imagesToUpload = Array.isArray(files) ? files : [files];
      const uploadedImageUrls: { uri: string | undefined; type: string | undefined; name: string | undefined }[] = [];

      const folderPath = `listings/${req?.user?.username}`;

      await Promise.all(
        imagesToUpload.map(async (file: UploadedFile) => {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: folderPath,
          });
          uploadedImageUrls.push({
            uri: result.secure_url,
            type: file.mimetype,
            name: file.name,
          });
        })
      );
      if (!name || !description || !pricePerHour || !categories?.length || !uploadedImageUrls.length) {
        return res.status(400).json(createResponse(null, true, 'Missing required fields', 400));
      }
      if (Number(pricePerHour) <= 0) {
        return res.status(400).json(createResponse(null, true, 'Invalid price', 400));
      }
      if (damagePolicy?.depositAmount > 5000) {
        return res.status(400).json(createResponse(null, true, 'Deposit amount too high', 400));
      }
      const listing: IListing = await Listing.create({
        title: name,
        description,
        pricePerHour: Number(pricePerHour),
        currency,
        categories,
        images: uploadedImageUrls,
         availability: {
          default: parsedAvailability.default,
          overrides: parsedAvailability.overrides
        },
        cancellationPolicy: parsedCancellationPolicy,
        damagePolicy: parsedDamagePolicy,
        logistics: parsedLogistics,
        owner: req.user.id,
      });
    console.log('finish upload images')
      res.status(201).json(createResponse(listing, false, 'Listing created successfully', 0));
    } catch (error) {
      console.error(error);
      res.status(500).json(createResponse(null, true, 'Failed to create listing', 500));
    }
  };
  export const getListingById = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const targetCurrency = req.query.currency?.toString().toUpperCase() || 'USD';
      const exchangeRates = getExchangeRates();
  
      
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(createResponse(null, true, "Invalid listing ID", 400));
      }
  
      const listing = await Listing.findById(id).populate("owner", "username email profile_image");
  
      if (!listing) {
        return res.status(404).json(createResponse(null, true, "Listing not found", 404));
      }
  
      const originalCurrency = listing.currency || 'USD';
      const rateFrom = exchangeRates?.[originalCurrency];
      const rateTo = exchangeRates?.[targetCurrency];
  
      const convert = (value: number): number => {
        if (originalCurrency === targetCurrency || !rateFrom || !rateTo) return value;
        return Math.round(((value / rateFrom) * rateTo) * 100) / 100;
      };
  
      const availability = listing.availability instanceof Map
        ? Object.fromEntries(listing.availability)
        : listing.availability;
  
      const response = {
        ...listing.toObject(),
        availability,
        price: {
          original: listing.pricePerHour,
          originalCurrency,
          converted: convert(listing.pricePerHour),
          targetCurrency,
        },
        logistics: {
          ...listing.logistics,
          deliveryPrice: {
            original: listing.logistics?.deliveryPrice || 0,
            converted: convert(listing.logistics?.deliveryPrice || 0),
            originalCurrency,
            targetCurrency,
          },
        },
        damagePolicy: {
          ...listing.damagePolicy,
          depositAmount: {
            original: listing.damagePolicy?.depositAmount || 0,
            converted: convert(listing.damagePolicy?.depositAmount || 0),
            originalCurrency,
            targetCurrency,
          },
        },
      };
  
      res.status(200).json(createResponse(response, false, "Listing fetched successfully", 0));
    } catch (error) {
      console.error("❌ getListingById error:", error);
      res.status(500).json(createResponse(null, true, "Failed to fetch listing", 500));
    }
  };
  