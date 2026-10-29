import mongoose from "mongoose";
import Contest from "../models/Contest.js";

// Get all contests
export const getContests = async (req, res, next) => {
    try {
        const status = req.query.status;

        const allContests = await Contest.find()
            .sort({ createdAt: -1 });

        let contests = allContests.map(function (contest) {
            return contest.toJSON();
        });

        if (status && status.toLowerCase() !== "all") {
            contests = contests.filter(function (contest) {
                return contest.status === status.toLowerCase();
            });
        }

        return res.status(200).json({
            success: true,
            count: contests.length,
            contests: contests
        });
    } catch (error) {
        next(error);
    }
};


// Get one contest by ID
export const getContestById = async (req, res, next) => {
    try {
        const id = req.params.id;

        // First, search using the custom contest ID
        let contest = await Contest.findOne({ id: id });

        // If not found, check whether it is a valid MongoDB ObjectId
        if (!contest && mongoose.isValidObjectId(id)) {
            contest = await Contest.findById(id);
        }

        // If the contest does not exist
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }

        // Return the contest
        return res.status(200).json({
            success: true,
            contest: contest.toJSON()
        });

    } catch (error) {
        next(error);
    }
};


// Create a new contest
export const createContest = async (req, res, next) => {
    try {
        const {
            id,
            title,
            category,
            description,
            deadline,
            status,
            maxSubmissions,
            image,
            criteria
        } = req.body;

        const existing = await Contest.findOne({ id: id });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A contest with this ID already exists."
            });
        }

        const contest = await Contest.create({
            id: id,
            title: title,
            category: category,
            description: description,
            deadline: deadline,
            status: status || "active",
            maxSubmissions: maxSubmissions || 3,
            image: image,
            criteria: criteria || {
                creativity: 40,
                technical: 30,
                themeFit: 30
            }
        });

        return res.status(201).json({
            success: true,
            contest: contest
        });
    } catch (error) {
        next(error);
    }
};
