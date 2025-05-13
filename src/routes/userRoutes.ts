import express from "express";
import { logoutUser, getUserProfile, refreshToken, getPaginatedListings, createListing } from "../controllers/userRoutesController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/logout", authenticateToken, logoutUser);
router.get("/profile", authenticateToken, getUserProfile);
router.post("/refresh-token", refreshToken);
router.get("/getPaginatedListings",authenticateToken, getPaginatedListings);
router.post("/createListing",authenticateToken, createListing);

export default router;
 