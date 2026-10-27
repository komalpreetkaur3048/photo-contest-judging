import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
    {
        entryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Entry",
            required: [true, "Entry ID is required"]
        },
        judgeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Judge ID is required"]
        },
        judgeName: {
            type: String,
            required: [true, "Judge name is required"],
            trim: true
        },
        creativity: {
            type: Number,
            required: [true, "Creativity score is required"],
            min: 0,
            max: 10
        },
        technical: {
            type: Number,
            required: [true, "Technical quality score is required"],
            min: 0,
            max: 10
        },
        theme: {
            type: Number,
            required: [true, "Theme-fit score is required"],
            min: 0,
            max: 10
        },
        weightedScore: {
            type: Number,
            required: [true, "Weighted score is required"]
        },
        judgedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Prevent the same judge from scoring the same entry twice
scoreSchema.index({ entryId: 1, judgeId: 1 }, { unique: true });

const Score = mongoose.model("Score", scoreSchema);

export default Score;
