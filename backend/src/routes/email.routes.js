const express = require('express');
const router = express.Router();
const { getEmailConfig, updateEmailConfig, sendTestEmail } = require('../controllers/email.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Only HR can access email configuration
router.get('/config', protect, authorize('HR'), getEmailConfig);
router.put('/config', protect, authorize('HR'), updateEmailConfig);
router.post('/test', protect, authorize('HR'), sendTestEmail);

module.exports = router;
