import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/User";
import { createResponse, IResponse } from "../utils/responseHelper";
import { generateRefreshToken, generateToken } from "../utils/tokenHelper";
import { Language, SiteContentRequestBody ,LANGUAGES} from "../types/language";
import path from "path";
import fs from "fs/promises";

const isValidLanguage = (lang: any): lang is Language => {
  return lang in LANGUAGES;
};


export const GetSiteContent = async (
  req: Request<{}, {}, SiteContentRequestBody>,
  res: Response
): Promise<any> => {
  const { language } = req.body;
  console.log('get site content '+ language)

  if (!isValidLanguage(language)) {
    res.status(400).json(createResponse(null, true, "Invalid language", 400));
    return;
  }
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "locales",
      `siteContent.${language}.json`
    );

    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);

    const languageInfo = LANGUAGES[language];

    const responseWithLanguageMeta = {
      ...parsed,
      languageMeta: {
        code: languageInfo.code,
        isRTL: languageInfo.isRTL,
      },
    };

    res
      .status(200)
      .json(createResponse(responseWithLanguageMeta, false, "Success", 0));
  } catch (err) {
    console.error("Error loading site content:", err);
    res
      .status(500)
      .json(createResponse(null, true, "Failed to load site content", 500));
  }
};

// **📌 REGISTER - הרשמת משתמש חדש**
export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, email, password, phone, location } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json(createResponse(null, true, "Missing required fields", 400));
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json(createResponse(null, true, "Username or email already exists", 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      location
    });

    await newUser.save();

    const userId: string = newUser._id instanceof Types.ObjectId ? newUser._id.toString() : newUser._id;


    res.status(201).json(createResponse({
        id: userId,
        username: newUser.username,
        email: newUser.email
    }, false, "User registered successfully", 0));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(null, true, "Error registering user", 500));
  }
};

// **📌 LOGIN - התחברות משתמש**
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createResponse(null, true, "Missing email or password", 400));
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.findOne({ username: email });
    }

    if (!user) {
      return res.status(404).json(createResponse(null, true, "User not found", 404));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(createResponse(null, true, "Invalid credentials", 400));
    }

    const token = generateToken(user._id.toString(), user.username);
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json(createResponse({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    }, false, "Login successful", 0));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(null, true, "Login failed", 500));
  }
};



export const checkUserAndAllowOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    //cheack also for passowrd if user is real
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json(createResponse(
        null, true, "Phone number is required",400));
    }

    // חיפוש משתמש לפי מספר פלאפון
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json(createResponse(
        null, true, "User not found",404));
    }

    // אם המשתמש נמצא, מחזירים אישור ללקוח לשלוח OTP
    // res.status(200).json({ success: true, message: "User verified. Send OTP from client." });
    return res.status(200).json(createResponse(
       null, false, "User verified. Send OTP from client.", 0));

  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json(createResponse(null, true, "Internal server error", 500));
  }
};