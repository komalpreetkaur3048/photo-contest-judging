import Contest from "../models/Contest.js";

// @desc    Get all contests (optionally filtered by ?status=active)
// @route   GET /api/contests
// @access  Public
export const getContests = async (req, res, next) => {
    try {
        const { status } = req.query;
        const allContests = await Contest.find().sort({ createdAt: -1 });

        let contests = allContests.map(c => c.toJSON());

        if (status && status.toLowerCase() !== "all") {
            contests = contests.filter(c => c.status === status.toLowerCase());
        }

        res.status(200).json({
            success: true,
            count: contests.length,
            contests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single contest by custom id (e.g., "nature-2026") or MongoDB _id
// @route   GET /api/contests/:id
// @access  Public
export const getContestById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Try finding by custom id slug first, then fallback to _id
        let contest = await Contest.findOne({ id: id });
        if (!contest && id.match(/^[0-9a-fA-F]{24}$/)) {
            contest = await Contest.findById(id);
        }

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found."
            });
        }

        res.status(200).json({
            success: true,
            contest: contest.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new contest
// @route   POST /api/contests
// @access  Private (Admin / Organizer)
export const createContest = async (req, res, next) => {
    try {
        const { id, title, category, description, deadline, status, maxSubmissions, image, criteria } = req.body;

        const existing = await Contest.findOne({ id });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A contest with this ID already exists."
            });
        }

        const contest = await Contest.create({
            id,
            title,
            category,
            description,
            deadline,
            status: status || "active",
            maxSubmissions: maxSubmissions || 3,
            image,
            criteria: criteria || { creativity: 40, technical: 30, themeFit: 30 }
        });

        res.status(201).json({
            success: true,
            contest
        });
    } catch (error) {
        next(error);
    }
};
