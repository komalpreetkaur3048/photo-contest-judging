
import Entry from "../models/Entry.js";
import Contest from "../models/Contest.js";
import Score from "../models/Score.js";

// Submit a new photograph
export const createEntry = async (req, res, next) => {
    try {
        const { contestId, title, description, image } = req.body;

        if (!contestId || !title || !description || !image) {
            return res.status(400).json({
                success: false,
                message: "Please provide contestId, title, description, and image."
            });
        }

        // Check contest
        const contest = await Contest.findOne({ id: contestId });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found."
            });
        }

        // Maximum 3 submissions per participant per contest
        const maxAllowed = 3;

        const existingCount = await Entry.countDocuments({
            participantId: req.user._id,
            contestId: contestId
        });

        if (existingCount >= maxAllowed) {
            return res.status(400).json({
                success: false,
                message: `You have reached the maximum limit of ${maxAllowed} submissions for this contest.`
            });
        }

        const newEntry = await Entry.create({
            participantId: req.user._id,
            participantName: req.user.name,
            contestId,
            title: title.trim(),
            description: description.trim(),
            image,
            judgingStatus: "submitted",
            judgesCompleted: 0,
            isRanked: false
        });

        return res.status(201).json({
            success: true,
            message: "Photograph submitted successfully!",
            entry: newEntry
        });
    } catch (error) {
        next(error);
    }
};

// Get all entries with optional filters
export const getAllEntries = async (req, res, next) => {
    try {
        const { contestId, judgingStatus } = req.query;

        const filter = {};

        if (contestId) filter.contestId = contestId;
        if (judgingStatus) filter.judgingStatus = judgingStatus;

        const entries = await Entry.find(filter).sort({ createdAt: -1 });
        const allScores = await Score.find();

        const formattedEntries = entries.map(entry => {
            const entryObj = entry.toObject();

            const entryScores = allScores.filter(
                score => String(score.entryId) === entry._id.toString()
            );

            const scoreCount = entryScores.length;

            entryObj.judgesCompleted = Math.max(
                entry.judgesCompleted || 0,
                scoreCount
            );

            if (entryObj.judgesCompleted >= 3) {
                entryObj.judgingStatus = "ranked";
                entryObj.isRanked = true;
            } else if (entryObj.judgesCompleted > 0) {
                entryObj.judgingStatus = "judging";
            }

            if (scoreCount > 0) {
                let totalScore = 0;

                for (let i = 0; i < scoreCount; i++) {
                    totalScore += entryScores[i].weightedScore || 0;
                }

                entryObj.finalScore = Number(
                    (totalScore / scoreCount).toFixed(2)
                );
            }

            return entryObj;
        });

        return res.status(200).json({
            success: true,
            count: formattedEntries.length,
            entries: formattedEntries
        });
    } catch (error) {
        next(error);
    }
};

// Get entries belonging to the logged-in participant
export const getMyEntries = async (req, res, next) => {
    try {
        const entries = await Entry.find({
            participantId: req.user._id
        }).sort({ createdAt: -1 });

        const allScores = await Score.find();

        const formattedEntries = entries.map(entry => {
            const entryObj = entry.toObject();

            const entryScores = allScores.filter(
                score => String(score.entryId) === entry._id.toString()
            );

            const scoreCount = entryScores.length;

            entryObj.judgesCompleted = Math.max(
                entry.judgesCompleted || 0,
                scoreCount
            );

            if (entryObj.judgesCompleted >= 3) {
                entryObj.judgingStatus = "ranked";
                entryObj.isRanked = true;
            } else if (entryObj.judgesCompleted > 0) {
                entryObj.judgingStatus = "judging";
            }

            if (scoreCount > 0) {
                let totalScore = 0;

                for (let i = 0; i < scoreCount; i++) {
                    totalScore += entryScores[i].weightedScore || 0;
                }

                entryObj.finalScore = Number(
                    (totalScore / scoreCount).toFixed(2)
                );
            }

            return entryObj;
        });

        return res.status(200).json({
            success: true,
            count: formattedEntries.length,
            entries: formattedEntries
        });
    } catch (error) {
        next(error);
    }
};

// Get one entry by ID
export const getEntryById = async (req, res, next) => {
    try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        return res.status(200).json({
            success: true,
            entry
        });
    } catch (error) {
        next(error);
    }
};

// Update an entry
export const updateEntry = async (req, res, next) => {
    try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        // Check ownership
        if (entry.participantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this entry."
            });
        }

        // Check whether judging has started
        if (
            entry.judgesCompleted > 0 ||
            entry.judgingStatus === "judging" ||
            entry.judgingStatus === "ranked"
        ) {
            return res.status(400).json({
                success: false,
                message: "This entry is locked because judging has already started."
            });
        }

        // Check contest deadline
        const contest = await Contest.findOne({ id: entry.contestId });

        if (contest && contest.toJSON().status === "completed") {
            return res.status(400).json({
                success: false,
                message: "This entry cannot be modified because the contest deadline has passed."
            });
        }

        const { title, description } = req.body;

        if (title) entry.title = title.trim();
        if (description) entry.description = description.trim();

        await entry.save();

        return res.status(200).json({
            success: true,
            message: "Entry updated successfully!",
            entry
        });
    } catch (error) {
        next(error);
    }
};

// Delete an entry
export const deleteEntry = async (req, res, next) => {
    try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        // Check ownership
        if (entry.participantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this entry."
            });
        }

        // Check whether judging has started
        if (
            entry.judgesCompleted > 0 ||
            entry.judgingStatus === "judging" ||
            entry.judgingStatus === "ranked"
        ) {
            return res.status(400).json({
                success: false,
                message: "This entry is locked because judging has already started."
            });
        }

        // Check contest deadline
        const contest = await Contest.findOne({ id: entry.contestId });

        if (contest && contest.toJSON().status === "completed") {
            return res.status(400).json({
                success: false,
                message: "This entry cannot be deleted because the contest deadline has passed."
            });
        }

        await Entry.findByIdAndDelete(req.params.id);
        await Score.deleteMany({ entryId: req.params.id });

        return res.status(200).json({
            success: true,
            message: "Photograph submission deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};
