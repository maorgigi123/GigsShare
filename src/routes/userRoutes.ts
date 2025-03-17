import express from "express";
import { logoutUser, getUserProfile, refreshToken, getPaginatedListings } from "../controllers/userRoutesController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/logout", authenticateToken, logoutUser);
router.get("/profile", authenticateToken, getUserProfile);
router.post("/refresh-token", refreshToken);
router.get("/getPaginatedListings",authenticateToken, getPaginatedListings); // No auth needed to view listings

export default router;
 