import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: [true, "Contest identifier is required"],
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
            creativity: {
                type: Number,
                default: 40
            },
            technical: {
                type: Number,
                default: 30
            },
            themeFit: {
                type: Number,
                default: 30
            }
        }
    },
    {
        timestamps: true
    }
);

// Canonical lifecycle calculation based on actual start and deadline timestamps
export const getContestLifecycleStatus = (contest, now = new Date()) => {
    if (!contest) return "upcoming";

    // Preserve administrative status override if present
    const rawStatus = (contest.status || "").toLowerCase();
    if (rawStatus === "draft" || rawStatus === "cancelled" || rawStatus === "archived") {
        return rawStatus;
    }

    const start = contest.startDate ? new Date(contest.startDate) : null;
    let end = contest.endDate ? new Date(contest.endDate) : null;

    // Fallback: If endDate is not populated, parse deadline string
    if ((!end || isNaN(end.getTime())) && contest.deadline) {
        const dlStr = String(contest.deadline).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(dlStr)) {
            end = new Date(`${dlStr}T23:59:59.999Z`);
        } else {
            const parsed = new Date(dlStr);
            if (!isNaN(parsed.getTime())) {
                end = parsed;
            }
        }
    }

    // If deadline has passed, it's completed
    const currentTime = now.getTime();
    if (end && !isNaN(end.getTime()) && currentTime > end.getTime()) {
        return "completed";
    }

    // If start date is in the future, it's upcoming
    if (start && !isNaN(start.getTime()) && currentTime < start.getTime()) {
        return "upcoming";
    }

    // If deadline has not passed and either started or start is not specified
    return rawStatus || "active";
};

// Automatically calculate and set lifecycle status before saving to MongoDB
contestSchema.pre("save", function () {
    this.status = getContestLifecycleStatus(this);
});

// Helper to batch-synchronize stored status in MongoDB based on current timestamp
export const syncContestStatusesInDB = async () => {
    try {
        const contests = await mongoose.model("Contest").find();
        let updatedCount = 0;
        for (const contest of contests) {
            const correctStatus = getContestLifecycleStatus(contest);
            if (contest.status !== correctStatus) {
                contest.status = correctStatus;
                await contest.save();
                updatedCount++;
            }
        }
        if (updatedCount > 0) {
            console.log(`✓ Synchronized ${updatedCount} contest statuses in MongoDB to match dates.`);
        }
    } catch (err) {
        console.warn("Could not synchronize contest statuses in DB:", err.message);
    }
};

// Automatically format 'id' and computed 'status' for frontend compatibility
contestSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret.id || ret.contestId || ret._id.toString();
        ret.status = getContestLifecycleStatus(doc);
        return ret;
    }
});

contestSchema.set("toObject", {
    transform: (doc, ret) => {
        ret.id = ret.id || ret.contestId || ret._id.toString();
        ret.status = getContestLifecycleStatus(doc);
        return ret;
    }
});

const Contest = mongoose.model("Contest", contestSchema);
Contest.getContestLifecycleStatus = getContestLifecycleStatus;
Contest.syncContestStatusesInDB = syncContestStatusesInDB;

export default Contest;
