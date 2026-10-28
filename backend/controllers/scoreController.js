import Score from "../models/Score.js";
import Entry from "../models/Entry.js";
import Contest from "../models/Contest.js";

// @desc    Submit an evaluation score for a photograph
// @route   POST /api/scores
// @access  Private (Judge only)
export const submitScore = async (req, res, next) => {
    try {
        const { entryId, creativity, technical } = req.body;
        const theme = req.body.theme !== undefined ? req.body.theme : req.body.themeFit;

        if (!entryId || creativity === undefined || technical === undefined || theme === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide entryId and scores for creativity, technical, and theme."
            });
        }

        // 1. Fetch Entry
        const entry = await Entry.findById(entryId);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        // 2. Prevent self-judging
        if (entry.participantId.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Integrity Violation: You cannot judge your own photograph submission."
            });
        }

        // 3. Prevent duplicate scoring
        const alreadyScored = await Score.findOne({
            entryId: entry._id,
            judgeId: req.user._id
        });

        if (alreadyScored) {
            return res.status(400).json({
                success: false,
                message: "You have already scored this photograph."
            });
        }

        // 4. Retrieve contest criteria for weighting (or default 40/30/30)
        const contest = await Contest.findOne({ id: entry.contestId });
        const weights = {
            creativity: (contest?.criteria?.creativity || 40) / 100,
            technical: (contest?.criteria?.technical || 30) / 100,
            theme: (contest?.criteria?.themeFit || 30) / 100
        };

        const cNum = Number(creativity);
        const tNum = Number(technical);
        const thNum = Number(theme);

        const calculatedScore = (cNum * weights.creativity) + (tNum * weights.technical) + (thNum * weights.theme);
        const weightedScore = Number(calculatedScore.toFixed(2));

        // 5. Create Score record
        const newScore = await Score.create({
            entryId: entry._id,
            judgeId: req.user._id,
            judgeName: req.user.name,
            creativity: cNum,
            technical: tNum,
            theme: thNum,
            weightedScore
        });

        // 6. Update Entry progress
        const totalScores = await Score.countDocuments({ entryId: entry._id });
        entry.judgesCompleted = totalScores;

        if (totalScores >= 3) {
            entry.judgingStatus = "ranked";
            entry.isRanked = true;
        } else {
            entry.judgingStatus = "judging";
        }

        await entry.save();

        res.status(201).json({
            success: true,
            message: "Evaluation score submitted successfully!",
            score: newScore,
            entryProgress: {
                judgesCompleted: entry.judgesCompleted,
                judgingStatus: entry.judgingStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all scores for a specific photograph
// @route   GET /api/scores/entry/:entryId
// @access  Public
export const getScoresByEntry = async (req, res, next) => {
    try {
        const scores = await Score.find({ entryId: req.params.entryId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: scores.length,
            scores
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all scores across all entries (for leaderboard engine)
// @route   GET /api/scores
// @access  Public
export const getAllScores = async (req, res, next) => {
    try {
        const scores = await Score.find({}).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: scores.length,
            scores
        });
    } catch (error) {
        next(error);
    }
};
