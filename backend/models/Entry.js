import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
    {
        participantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Participant ID is required"]
        },
        participantName: {
            type: String,
            required: [true, "Participant name is required"],
            trim: true
        },
        contestId: {
            type: String,
            required: [true, "Contest identifier is required"],
            trim: true
        },
        title: {
            type: String,
            required: [true, "Photograph title is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Photograph description is required"],
            trim: true
        },
        image: {
            type: String,
            required: [true, "Photograph image data or URL is required"]
        },
        judgingStatus: {
            type: String,
            enum: ["submitted", "judging", "ranked"],
            default: "submitted"
        },
        judgesCompleted: {
            type: Number,
            default: 0
        },
        isRanked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;
