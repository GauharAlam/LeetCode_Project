const Problem = require('../models/problems');

// Get daily challenge - returns a random problem that changes daily
const getDailyChallenge = async (req, res) => {
    try {
        // Use today's date as seed for consistent daily selection
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

        // Get all problems
        const problems = await Problem.find({})
            .select('title difficulty tags companies')
            .lean();

        if (problems.length === 0) {
            return res.status(404).json({ message: "No problems available" });
        }

        // Create a simple hash from date string for consistent daily selection
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) {
            hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }

        // Select problem based on hash
        const index = Math.abs(hash) % problems.length;
        const dailyProblem = problems[index];

        res.status(200).json({
            ...dailyProblem,
            date: today.toISOString().split('T')[0]
        });
    } catch (error) {
        console.error("Get daily challenge error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getDailyChallenge };
