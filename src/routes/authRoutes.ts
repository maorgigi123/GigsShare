import express from "express";
import { registerUser, loginUser,GetSiteContent } from "../controllers/authRoutesController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


export default router;
