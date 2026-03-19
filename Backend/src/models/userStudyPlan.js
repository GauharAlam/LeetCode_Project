const mongoose = require("mongoose");
const { Schema } = mongoose;

const userStudyPlanSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    studyPlanId: {
        type: Schema.Types.ObjectId,
        ref: "studyPlan",
        required: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "completed", "paused"],
        default: "active"
    },
    currentDay: {
        type: Number,
        default: 1
    },
    // Track which problems the user has solved within this plan
    solvedProblems: [{
        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem"
        },
        solvedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// A user can only enroll in a study plan once
userStudyPlanSchema.index({ userId: 1, studyPlanId: 1 }, { unique: true });

const UserStudyPlan = mongoose.model("userStudyPlan", userStudyPlanSchema);
module.exports = UserStudyPlan;
