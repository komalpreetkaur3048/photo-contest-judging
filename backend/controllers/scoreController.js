
import Score from "../models/Score.js";
import Entry from "../models/Entry.js";
import Contest from "../models/Contest.js";

// Submit a score
export const submitScore = async (req, res, next) => {
    try {
        const { entryId, creativity, technical,theme } = req.body;
        
        if (
            !entryId ||
            creativity === undefined ||
            technical === undefined ||
            theme === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide entryId and all scores."
            });
        }

        // Find photograph
        const entry = await Entry.findById(entryId);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        // Prevent judge from scoring their own photograph
        if (entry.participantId.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot judge your own photograph."
            });
        }

        // Check if judge already scored this photograph
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

        // Get contest weights
        const contest = await Contest.findOne({
            id: entry.contestId
        });

        let creativityWeight = 40;
        let technicalWeight = 30;
        let themeWeight = 30;

        if (contest && contest.criteria) {
            creativityWeight = contest.criteria.creativity || 40;
            technicalWeight = contest.criteria.technical || 30;
            themeWeight = contest.criteria.themeFit || 30;
        }

        creativityWeight = creativityWeight / 100;
        technicalWeight = technicalWeight / 100;
        themeWeight = themeWeight / 100;

        // Convert scores to numbers
        const c = Number(creativity);
        const t = Number(technical);
        const h = Number(theme);

        // Calculate weighted score
        const calculatedScore =
            c * creativityWeight +
            t * technicalWeight +
            h * themeWeight;

        const weightedScore = Number(calculatedScore.toFixed(2));

        // Save score
        const newScore = await Score.create({
            entryId: entry._id,
            judgeId: req.user._id,
            judgeName: req.user.name,
            creativity: c,
            technical: t,
            theme: h,
            weightedScore: weightedScore
        });

        // Update judging progress
        const totalScores = await Score.countDocuments({
            entryId: entry._id
        });

        entry.judgesCompleted = totalScores;

        if (totalScores >= 3) {
            entry.judgingStatus = "ranked";
            entry.isRanked = true;
        } else {
            entry.judgingStatus = "judging";
        }

        await entry.save();

        return res.status(201).json({
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


// Get scores for one photograph
export const getScoresByEntry = async (req, res, next) => {
    try {
        const scores = await Score.find({
            entryId: req.params.entryId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: scores.length,
            scores: scores
        });
    } catch (error) {
        next(error);
    }
};


// Get all scores
export const getAllScores = async (req, res, next) => {
    try {
        const scores = await Score.find({})
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: scores.length,
            scores: scores
        });
    } catch (error) {
        next(error);
    }
};
