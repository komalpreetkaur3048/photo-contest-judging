import mongoose from "mongoose";

// 1. Define Contest Schema
const contestSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: [true, "Contest ID is required (e.g. nature-2026)"],
            unique: true,
            trim: true
        },
        title: {
            type: String,
            required: [true, "Contest title is required"],
            trim: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },
        deadline: {
            type: String,
            required: [true, "Deadline is required"]
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ["active", "upcoming", "completed", "draft", "cancelled", "archived"],
            default: "active"
        },
        maxSubmissions: {
            type: Number,
            default: 3
        },
        image: {
            type: String,
            required: [true, "Cover image URL is required"]
        },
        criteria: {
            creativity: { type: Number, default: 40 },
            technical: { type: Number, default: 30 },
            themeFit: { type: Number, default: 30 }
        }
    },
    {
        timestamps: true
    }
);

// 2. Helper: Check if contest is 'upcoming', 'active', or 'completed' based on dates
export const getContestLifecycleStatus = (contest) => {
    if (!contest) return "active";

    // Keep manual admin statuses unchanged
    if (["draft", "cancelled", "archived"].includes(contest.status)) {
        return contest.status;
    }

    const now = new Date();
    const startDate = contest.startDate ? new Date(contest.startDate) : null;
    const endDate = contest.endDate ? new Date(contest.endDate) : (contest.deadline ? new Date(contest.deadline) : null);

    // If deadline has passed -> completed
    if (endDate && now > endDate) {
        return "completed";
    }

    // If start date is in the future -> upcoming
    if (startDate && now < startDate) {
        return "upcoming";
    }

    // Otherwise -> active
    return "active";
};

// 3. Automatically update status before saving to MongoDB
contestSchema.pre("save", function () {
    this.status = getContestLifecycleStatus(this);
});

// 4. Format JSON output so the frontend always has id and current status
contestSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret.id || ret._id;
        ret.status = getContestLifecycleStatus(doc);
        return ret;
    }
});

// 5. Create Model
const Contest = mongoose.model("Contest", contestSchema);

// 6. Helper: Sync all contest statuses on server startup
export const syncContestStatusesInDB = async () => {
    try {
        const contests = await Contest.find();
        for (const contest of contests) {
            const currentStatus = getContestLifecycleStatus(contest);
            if (contest.status !== currentStatus) {
                contest.status = currentStatus;
                await contest.save();
            }
        }
    } catch (err) {
        console.error("Could not sync contest statuses:", err.message);
    }
};

// Attach helper methods to Contest model
Contest.getContestLifecycleStatus = getContestLifecycleStatus;
Contest.syncContestStatusesInDB = syncContestStatusesInDB;

export default Contest;
