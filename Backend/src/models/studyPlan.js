const mongoose = require("mongoose");
const { Schema } = mongoose;

const studyPlanSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "mixed"],
        required: true
    },
    duration: {
        type: Number, // in days
        required: true,
        min: 1
    },
    icon: {
        type: String,
        default: "target"
    },
    color: {
        type: String,
        default: "from-blue-500 to-cyan-500"
    },
    topics: [{
        type: String,
        trim: true
    }],
    // Problems organized by day
    days: [{
        dayNumber: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            default: ""
        },
        problems: [{
            type: Schema.Types.ObjectId,
            ref: "Problem"
        }]
    }],
    isOfficial: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    enrolledCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

studyPlanSchema.index({ isOfficial: 1 });
studyPlanSchema.index({ createdBy: 1 });
studyPlanSchema.index({ isPublic: 1 });

const StudyPlan = mongoose.model("studyPlan", studyPlanSchema);
module.exports = StudyPlan;
