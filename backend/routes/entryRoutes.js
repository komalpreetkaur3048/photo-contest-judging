import express from "express";
import {
    createEntry,
    getAllEntries,
    getMyEntries,
    getEntryById,
    updateEntry,
    deleteEntry
} from "../controllers/entryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllEntries);
router.get("/my", protect, getMyEntries);
router.get("/:id", getEntryById);
router.post("/", protect, createEntry);
router.put("/:id", protect, updateEntry);
router.delete("/:id", protect, deleteEntry);

export default router;
