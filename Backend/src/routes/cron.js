const express = require('express');
const router = express.Router();
const { runMaintenance } = require('../controllers/maintenanceController');

// Maintenance endpoint - should be hit by cron-job.org
// For security, you can check for a CRON_SECRET header if needed
router.get('/maintenance', (req, res, next) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers['x-cron-secret'] !== cronSecret) {
        return res.status(401).json({ message: "Unauthorized cron request" });
    }
    next();
}, runMaintenance);

module.exports = router;
