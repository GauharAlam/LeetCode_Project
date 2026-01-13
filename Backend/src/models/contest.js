const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 200
    },
    description: {
        type: String,
        maxLength: 1000
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'problem'
    }],
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        score: {
            type: Number,
            default: 0
        },
        solvedProblems: [{
            problemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'problem'
            },
            solvedAt: Date,
            timeTaken: Number // in seconds
        }],
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['upcoming', 'live', 'ended'],
        default: 'upcoming'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
contestSchema.index({ status: 1, startTime: 1 });

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
