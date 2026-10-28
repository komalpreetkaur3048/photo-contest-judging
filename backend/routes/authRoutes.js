import express from "express";
import {
    register,
    login,
    getMe,
    createJudgeInvite,
    getJudgeInvites
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Judge invite code management
router.post("/judge-invites", createJudgeInvite);
router.get("/judge-invites", getJudgeInvites);

// Protected routes
router.get("/me", protect, getMe);

export default router;
