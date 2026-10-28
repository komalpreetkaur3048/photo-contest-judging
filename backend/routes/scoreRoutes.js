import express from "express";
import {
    submitScore,
    getScoresByEntry,
    getAllScores
} from "../controllers/scoreController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllScores);
router.get("/entry/:entryId", getScoresByEntry);
router.post("/", protect, requireRole("judge"), submitScore);

export default router;
