import express from "express";
import {
    getExplorePhotos,
    createExplorePhoto,
    likeExplorePhoto
} from "../controllers/exploreController.js";

const router = express.Router();

router.get("/", getExplorePhotos);
router.post("/", createExplorePhoto);
router.put("/:id/like", likeExplorePhoto);

export default router;
