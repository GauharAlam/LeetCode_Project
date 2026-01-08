const Contest = require('../models/contest');

// Get all contests
const getContests = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        const now = new Date();

        // Auto-update contest status
        await Contest.updateMany(
            { startTime: { $lte: now }, endTime: { $gt: now }, status: 'upcoming' },
            { status: 'live' }
        );
        await Contest.updateMany(
            { endTime: { $lte: now }, status: { $ne: 'ended' } },
            { status: 'ended' }
        );

        if (status) {
            filter.status = status;
        }

        const contests = await Contest.find(filter)
            .populate('problems', 'title difficulty')
            .sort({ startTime: -1 })
            .limit(20);

        res.status(200).json(contests);
    } catch (error) {
        console.error("Get contests error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get single contest
const getContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.result._id;

        const contest = await Contest.findById(contestId)
            .populate('problems', 'title difficulty tags')
            .populate('participants.userId', 'firstName');

        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Check if user is participant
        const isParticipant = contest.participants.some(
            p => p.userId._id.toString() === userId.toString()
        );

        res.status(200).json({ ...contest.toObject(), isParticipant });
    } catch (error) {
        console.error("Get contest error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Join contest
const joinContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.result._id;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        if (contest.status === 'ended') {
            return res.status(400).json({ message: "Contest has ended" });
        }

        // Check if already joined
        const alreadyJoined = contest.participants.some(
            p => p.userId.toString() === userId.toString()
        );

        if (alreadyJoined) {
            return res.status(400).json({ message: "Already joined this contest" });
        }

        contest.participants.push({ userId, score: 0, solvedProblems: [] });
        await contest.save();

        res.status(200).json({ message: "Successfully joined contest" });
    } catch (error) {
        console.error("Join contest error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get contest leaderboard
const getContestLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;

        const contest = await Contest.findById(contestId)
            .populate('participants.userId', 'firstName')
            .select('participants title');

        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        const leaderboard = contest.participants
            .map(p => ({
                userId: p.userId._id,
                name: p.userId.firstName,
                score: p.score,
                problemsSolved: p.solvedProblems.length,
                totalTime: p.solvedProblems.reduce((acc, sp) => acc + (sp.timeTaken || 0), 0)
            }))
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.totalTime - b.totalTime; // Faster wins on tie
            })
            .map((p, idx) => ({ ...p, rank: idx + 1 }));

        res.status(200).json({ title: contest.title, leaderboard });
    } catch (error) {
        console.error("Get contest leaderboard error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create contest (admin only)
const createContest = async (req, res) => {
    try {
        const userId = req.result._id;
        const { title, description, startTime, endTime, duration, problems } = req.body;

        const contest = await Contest.create({
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration,
            problems,
            createdBy: userId,
            status: new Date(startTime) > new Date() ? 'upcoming' : 'live'
        });

        res.status(201).json(contest);
    } catch (error) {
        console.error("Create contest error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getContests, getContest, joinContest, getContestLeaderboard, createContest };
