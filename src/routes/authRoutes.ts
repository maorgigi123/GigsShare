import express from "express";
import { registerUser, loginUser, checkUserAndAllowOTP,GetSiteContent } from "../controllers/authRoutesController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/allowOTP", checkUserAndAllowOTP);


export default router;
