const express = require('express');
const router = express.Router();
const { clearOldData, resetVehicles, getAllLogs } = require('../controllers/maintenance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Only HR/Admin with Dev access can hit these
router.post('/clear-data', protect, authorize('HR'), clearOldData);
router.post('/reset-vehicles', protect, authorize('HR'), resetVehicles);
router.get('/logs', protect, authorize('HR'), getAllLogs);

module.exports = router;
