const User = require("../models/user");
const Problem = require("../models/problems");
const Submission = require("../models/submission");

// Get user dashboard stats
const getUserDashboard = async (req, res) => {
    try {
        console.log('Dashboard API called');
        const userId = req.result?._id;
        console.log('User ID:', userId);

        if (!userId) {
            console.log('No user ID found in request');
            return res.status(401).json({ message: "Unauthorized - Please login" });
        }

        // Get user with populated problemSolved
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty"
        });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get total problems by difficulty
        const totalProblems = await Problem.aggregate([
            {
                $group: {
                    _id: "$difficulty",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format total problems
        const totalByDifficulty = {
            easy: 0,
            medium: 0,
            hard: 0
        };
        totalProblems.forEach(item => {
            totalByDifficulty[item._id] = item.count;
        });
        const totalCount = totalByDifficulty.easy + totalByDifficulty.medium + totalByDifficulty.hard;

        // Calculate solved problems by difficulty
        const solvedByDifficulty = {
            easy: 0,
            medium: 0,
            hard: 0
        };
        user.problemSolved.forEach(problem => {
            if (problem.difficulty) {
                solvedByDifficulty[problem.difficulty]++;
            }
        });
        const solvedCount = user.problemSolved.length;

        // Get recent submissions (last 10)
        const recentSubmissions = await Submission.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate({
                path: "problemId",
                select: "_id title difficulty"
            });

        // Get submission activity for current year (for heatmap)
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        const submissionActivity = await Submission.aggregate([
            {
                $match: {
                    userId: user._id,
                    createdAt: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get language statistics
        const languageStats = await Submission.aggregate([
            {
                $match: { userId: user._id }
            },
            {
                $group: {
                    _id: "$language",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId
            },
            stats: {
                solved: {
                    total: solvedCount,
                    easy: solvedByDifficulty.easy,
                    medium: solvedByDifficulty.medium,
                    hard: solvedByDifficulty.hard
                },
                total: {
                    count: totalCount,
                    easy: totalByDifficulty.easy,
                    medium: totalByDifficulty.medium,
                    hard: totalByDifficulty.hard
                }
            },
            recentSubmissions: recentSubmissions.map(sub => ({
                _id: sub._id,
                problem: sub.problemId,
                language: sub.language,
                status: sub.status,
                runtime: sub.runtime,
                memory: sub.memory,
                createdAt: sub.createdAt
            })),
            submissionActivity,
            languageStats
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId).select(
            '-password -__v'
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        // Fields that can be updated
        const allowedUpdates = [
            'firstName', 'lastName', 'bio', 'location', 'company',
            'jobTitle', 'institution', 'website', 'github', 'linkedin',
            'twitter', 'youtube', 'instagram', 'leetcode'
        ];

        // Filter out fields that are not allowed
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getUserDashboard, getUserProfile, updateUserProfile };
