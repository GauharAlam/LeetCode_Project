const User = require("../models/user");
const Problem = require("../models/problems");
const Submission = require("../models/submission");

// Get user dashboard stats
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.result?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Please login" });
        }

        // Run independent queries in parallel for maximum performance
        const [user, totalProblemsRaw, recentSubmissions, submissionActivity, languageStats] = await Promise.all([
            User.findById(userId).populate({
                path: "problemSolved",
                select: "_id title difficulty"
            }),
            Problem.aggregate([
                {
                    $group: {
                        _id: "$difficulty",
                        count: { $sum: 1 }
                    }
                }
            ]),
            Submission.find({ userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate({
                    path: "problemId",
                    select: "_id title difficulty"
                }),
            // Get submission activity for current year
            Submission.aggregate([
                {
                    $match: {
                        userId: req.result._id,
                        createdAt: { 
                            $gte: new Date(new Date().getFullYear(), 0, 1), 
                            $lte: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59) 
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            // Get language statistics
            Submission.aggregate([
                { $match: { userId: req.result._id } },
                { $group: { _id: "$language", count: { $sum: 1 } } }
            ])
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Format total problems by difficulty
        const totalByDifficulty = { easy: 0, medium: 0, hard: 0 };
        totalProblemsRaw.forEach(item => {
            if (item._id) totalByDifficulty[item._id.toLowerCase()] = item.count;
        });
        const totalCount = totalByDifficulty.easy + totalByDifficulty.medium + totalByDifficulty.hard;

        // Calculate solved problems by difficulty from populated data
        const solvedByDifficulty = { easy: 0, medium: 0, hard: 0 };
        (user.problemSolved || []).forEach(problem => {
            if (problem.difficulty) {
                solvedByDifficulty[problem.difficulty.toLowerCase()]++;
            }
        });
        const solvedCount = user.problemSolved?.length || 0;

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                bio: user.bio,
                location: user.location
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

// Get Global Platform Stats
const getGlobalStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        
        // Get total problems and break them down by difficulty
        const totalProblems = await Problem.aggregate([
            {
                $group: {
                    _id: "$difficulty",
                    count: { $sum: 1 }
                }
            }
        ]);

        const problemsByDifficulty = { easy: 0, medium: 0, hard: 0 };
        let totalProblemsCount = 0;
        
        totalProblems.forEach(item => {
            problemsByDifficulty[item._id] = item.count;
            totalProblemsCount += item.count;
        });

        // Get count of accepted submissions
        const acceptedSubmissions = await Submission.countDocuments({ status: "Accepted" });
        const pendingSubmissions = await Submission.countDocuments({ status: "Pending" });

        // Get unique languages used
        const uniqueLanguages = await Submission.distinct("language");

        res.status(200).json({
            users: totalUsers,
            problems: {
                total: totalProblemsCount,
                easy: problemsByDifficulty.easy,
                medium: problemsByDifficulty.medium,
                hard: problemsByDifficulty.hard
            },
            submissions: {
                total: totalSubmissions,
                accepted: acceptedSubmissions,
                pending: pendingSubmissions
            },
            languages: uniqueLanguages.length
        });

    } catch (error) {
        console.error("Global stats error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getUserDashboard, getUserProfile, updateUserProfile, getGlobalStats };
