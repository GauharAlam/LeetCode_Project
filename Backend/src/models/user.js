const mongoose = require("mongoose");
const { Schema } = mongoose;


const userSchema = new Schema({

    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20

    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    age: {
        type: Number,
        min: 10,
        max: 60
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    problemSolved: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'problem'
        }],
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // Profile - Personal Information
    bio: {
        type: String,
        default: '',
        maxLength: 500
    },
    location: {
        type: String,
        default: '',
        maxLength: 100
    },
    company: {
        type: String,
        default: '',
        maxLength: 100
    },
    jobTitle: {
        type: String,
        default: '',
        maxLength: 100
    },
    institution: {
        type: String,
        default: '',
        maxLength: 100
    },
    website: {
        type: String,
        default: '',
        maxLength: 200
    },
    // Profile - Social Links
    github: {
        type: String,
        default: '',
        maxLength: 200
    },
    linkedin: {
        type: String,
        default: '',
        maxLength: 200
    },
    twitter: {
        type: String,
        default: '',
        maxLength: 200
    },
    youtube: {
        type: String,
        default: '',
        maxLength: 200
    },
    instagram: {
        type: String,
        default: '',
        maxLength: 200
    },
    leetcode: {
        type: String,
        default: '',
        maxLength: 200
    },
    // Engagement - Streak System
    streak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: null
    },
    // Engagement - Badges/Achievements
    badges: [{
        name: {
            type: String,
            required: true
        },
        earnedAt: {
            type: Date,
            default: Date.now
        },
        icon: {
            type: String,
            default: 'star'
        }
    }]

}, { timestamps: true })

const User = mongoose.model("user", userSchema);

module.exports = User;