import express from "express";
import {
    getContests,
    getContestById,
    createContest
} from "../controllers/contestController.js";

const router = express.Router();

router.get("/", getContests);
router.get("/:id", getContestById);
router.post("/", createContest);

export default router;
