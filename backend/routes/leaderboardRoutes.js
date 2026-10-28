import express from "express";
import { getLeaderboard, getEntryResult } from "../controllers/leaderboardController.js";

const router = express.Router();

// Public routes for leaderboard & results
router.get("/", getLeaderboard);
router.get("/result/:entryId", getEntryResult);

export default router;
