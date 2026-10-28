import Entry from "../models/Entry.js";
import Contest from "../models/Contest.js";
import Score from "../models/Score.js";

// @desc    Submit a new photograph entry
// @route   POST /api/entries
// @access  Private (Participant)
export const createEntry = async (req, res, next) => {
    try {
        const { contestId, title, description, image } = req.body;

        if (!contestId || !title || !description || !image) {
            return res.status(400).json({
                success: false,
                message: "Please provide contestId, title, description, and image."
            });
        }

        // Verify contest exists
        const contest = await Contest.findOne({ id: contestId });
        const maxAllowed = contest?.maxSubmissions || 3;

        // Check submission cap for this participant in this contest
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

        res.status(201).json({
            success: true,
            message: "Photograph submitted successfully!",
            entry: newEntry
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all entries (supports ?contestId= & ?status=)
// @route   GET /api/entries
// @access  Public
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
            const entryScores = allScores.filter(s => String(s.entryId) === entry._id.toString());
            
            entryObj.judgesCompleted = Math.max(entry.judgesCompleted || 0, entryScores.length);
            if (entryObj.judgesCompleted >= 3) {
                entryObj.judgingStatus = "ranked";
                entryObj.isRanked = true;
            } else if (entryObj.judgesCompleted > 0) {
                entryObj.judgingStatus = "judging";
            }

            if (entryScores.length > 0) {
                const sum = entryScores.reduce((acc, s) => acc + (s.weightedScore || 0), 0);
                entryObj.finalScore = Number((sum / entryScores.length).toFixed(2));
            }

            return entryObj;
        });

        res.status(200).json({
            success: true,
            count: formattedEntries.length,
            entries: formattedEntries
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get entries submitted by logged-in participant
// @route   GET /api/entries/my
// @access  Private (Participant)
export const getMyEntries = async (req, res, next) => {
    try {
        const entries = await Entry.find({ participantId: req.user._id }).sort({ createdAt: -1 });
        const allScores = await Score.find();

        const formattedEntries = entries.map(entry => {
            const entryObj = entry.toObject();
            const entryScores = allScores.filter(s => String(s.entryId) === entry._id.toString());
            
            entryObj.judgesCompleted = Math.max(entry.judgesCompleted || 0, entryScores.length);
            if (entryObj.judgesCompleted >= 3) {
                entryObj.judgingStatus = "ranked";
                entryObj.isRanked = true;
            } else if (entryObj.judgesCompleted > 0) {
                entryObj.judgingStatus = "judging";
            }

            if (entryScores.length > 0) {
                const sum = entryScores.reduce((acc, s) => acc + (s.weightedScore || 0), 0);
                entryObj.finalScore = Number((sum / entryScores.length).toFixed(2));
            }

            return entryObj;
        });

        res.status(200).json({
            success: true,
            count: formattedEntries.length,
            entries: formattedEntries
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single entry by ID
// @route   GET /api/entries/:id
// @access  Public
export const getEntryById = async (req, res, next) => {
    try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        res.status(200).json({
            success: true,
            entry
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an entry (title, description)
// @route   PUT /api/entries/:id
// @access  Private (Owner only)
export const updateEntry = async (req, res, next) => {
    try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        // Ownership check
        if (entry.participantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this entry."
            });
        }

        // Locking check: if judging has started
        if (entry.judgesCompleted > 0 || entry.judgingStatus === "judging" || entry.judgingStatus === "ranked") {
            return res.status(400).json({
                success: false,
                message: "This entry is locked because judging has already started."
            });
        }

        // Contest deadline check: if contest deadline has passed
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

        res.status(200).json({
            success: true,
            message: "Entry updated successfully!",
            entry
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an entry
// @route   DELETE /api/entries/:id
// @access  Private (Owner only)
export const deleteEntry = async (req, res, next) => {
    try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Photograph entry not found."
            });
        }

        // Ownership check
        if (entry.participantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this entry."
            });
        }

        // Locking check: if judging has started
        if (entry.judgesCompleted > 0 || entry.judgingStatus === "judging" || entry.judgingStatus === "ranked") {
            return res.status(400).json({
                success: false,
                message: "This entry is locked because judging has already started."
            });
        }

        // Contest deadline check: if contest deadline has passed
        const contest = await Contest.findOne({ id: entry.contestId });
        if (contest && contest.toJSON().status === "completed") {
            return res.status(400).json({
                success: false,
                message: "This entry cannot be deleted because the contest deadline has passed."
            });
        }

        await Entry.findByIdAndDelete(req.params.id);

        // Also clean up any associated scores if any existed
        await Score.deleteMany({ entryId: req.params.id });

        res.status(200).json({
            success: true,
            message: "Photograph submission deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};
