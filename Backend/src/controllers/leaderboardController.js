const User = require('../models/user');

// Get leaderboard - top users ranked by problems solved
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('firstName emailId problemSolved createdAt')
            .lean();

        // Calculate stats and sort by problems solved
        const leaderboard = users
            .map(user => ({
                _id: user._id,
                firstName: user.firstName,
                email: user.emailId.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
                problemsSolved: user.problemSolved?.length || 0,
                joinedAt: user.createdAt
            }))
            .sort((a, b) => b.problemsSolved - a.problemsSolved)
            .slice(0, 100) // Top 100
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }));

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Get leaderboard error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user's rank
const getUserRank = async (req, res) => {
    try {
        const userId = req.result._id;

        const users = await User.find({ role: 'user' })
            .select('_id problemSolved')
            .lean();

        const sortedUsers = users
            .map(user => ({
                _id: user._id.toString(),
                problemsSolved: user.problemSolved?.length || 0
            }))
            .sort((a, b) => b.problemsSolved - a.problemsSolved);

        const userRank = sortedUsers.findIndex(u => u._id === userId.toString()) + 1;
        const totalUsers = sortedUsers.length;

        res.status(200).json({
            rank: userRank,
            totalUsers,
            percentile: Math.round((1 - userRank / totalUsers) * 100)
        });
    } catch (error) {
        console.error("Get user rank error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getLeaderboard, getUserRank };
