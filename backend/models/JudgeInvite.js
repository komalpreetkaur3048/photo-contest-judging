import mongoose from "mongoose";

const judgeInviteSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedByEmail: {
        type: String,
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const JudgeInvite = mongoose.model("JudgeInvite", judgeInviteSchema);

export default JudgeInvite;
