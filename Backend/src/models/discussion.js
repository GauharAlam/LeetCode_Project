const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxLength: 200
    },
    content: {
        type: String,
        required: true,
        maxLength: 5000
    },
    tags: [{
        type: String,
        enum: ['solution', 'question', 'approach', 'optimization', 'bug', 'other']
    }],
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    replies: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxLength: 2000
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient problem-based queries
discussionSchema.index({ problemId: 1, createdAt: -1 });

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;
