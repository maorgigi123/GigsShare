import express from "express";
import { logoutUser, getUserProfile, refreshToken, getPaginatedListings, createListing, getListingById, getAllExchange, updateFcmToken } from "../controllers/userRoutesController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/logout", authenticateToken, logoutUser);
router.get("/profile", authenticateToken, getUserProfile);
router.post("/refresh-token", refreshToken);
router.get("/getPaginatedListings",authenticateToken, getPaginatedListings);
router.get("/listing/getListingById/:id",authenticateToken,getListingById)
router.post("/createListing",authenticateToken, createListing);
router.get("/getAllExchange", getAllExchange);
router.post("/users/update-fcm-token",authenticateToken,updateFcmToken)


export default router;
 