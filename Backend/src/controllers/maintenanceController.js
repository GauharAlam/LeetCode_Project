const Contest = require('../models/contest');

// Perform maintenance tasks
const runMaintenance = async (req, res) => {
    try {
        const now = new Date();
        console.log(`[Cron] Running maintenance at ${now.toISOString()}`);

        // Update contest statuses
        const upcomingToLive = await Contest.updateMany(
            { startTime: { $lte: now }, endTime: { $gt: now }, status: 'upcoming' },
            { status: 'live' }
        );

        const liveToEnded = await Contest.updateMany(
            { endTime: { $lte: now }, status: { $ne: 'ended' } },
            { status: 'ended' }
        );

        res.status(200).json({
            message: "Maintenance complete",
            timestamp: now,
            updates: {
                upcomingToLive: upcomingToLive.modifiedCount,
                liveToEnded: liveToEnded.modifiedCount
            }
        });
    } catch (error) {
        console.error("[Cron] Maintenance error:", error);
        res.status(500).json({ message: "Maintenance failed", error: error.message });
    }
};

module.exports = { runMaintenance };
