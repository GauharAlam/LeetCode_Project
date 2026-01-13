const User = require('../models/user');

// Badge definitions
const BADGE_DEFINITIONS = [
    { name: 'First Steps', description: 'Solve your first problem', threshold: 1, icon: 'baby' },
    { name: 'Problem Solver', description: 'Solve 10 problems', threshold: 10, icon: 'target' },
    { name: 'Dedicated Coder', description: 'Solve 50 problems', threshold: 50, icon: 'flame' },
    { name: 'Elite Coder', description: 'Solve 100 problems', threshold: 100, icon: 'trophy' },
    { name: 'Legend', description: 'Solve 500 problems', threshold: 500, icon: 'crown' },
    { name: 'Streak Starter', description: '7 day streak', threshold: 7, type: 'streak', icon: 'zap' },
    { name: 'Consistency King', description: '30 day streak', threshold: 30, type: 'streak', icon: 'fire' },
];

// Check and award badges based on user stats
const checkAndAwardBadges = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        const problemCount = user.problemSolved?.length || 0;
        const currentStreak = user.streak || 0;
        const existingBadges = user.badges?.map(b => b.name) || [];
        const newBadges = [];

        for (const badge of BADGE_DEFINITIONS) {
            if (existingBadges.includes(badge.name)) continue;

            let earned = false;
            if (badge.type === 'streak') {
                earned = currentStreak >= badge.threshold;
            } else {
                earned = problemCount >= badge.threshold;
            }

            if (earned) {
                newBadges.push({
                    name: badge.name,
                    earnedAt: new Date(),
                    icon: badge.icon
                });
            }
        }

        if (newBadges.length > 0) {
            user.badges.push(...newBadges);
            await user.save();
        }

        return newBadges;
    } catch (error) {
        console.error("Badge check error:", error);
        return [];
    }
};

// Get all badge definitions
const getBadgeDefinitions = async (req, res) => {
    try {
        res.status(200).json(BADGE_DEFINITIONS);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user's badges
const getUserBadges = async (req, res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).select('badges');

        res.status(200).json({
            earned: user.badges || [],
            available: BADGE_DEFINITIONS.map(b => ({
                ...b,
                earned: user.badges?.some(ub => ub.name === b.name) || false
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { checkAndAwardBadges, getBadgeDefinitions, getUserBadges, BADGE_DEFINITIONS };
