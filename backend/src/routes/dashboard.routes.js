const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsageReport } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Everyone can see their own dash stats
router.get('/stats', protect, getDashboardStats);
router.get('/reports', protect, authorize('HR'), getUsageReport);
router.get('/recent-activities', protect, require('../controllers/dashboard.controller').getRecentActivities);

module.exports = router;
