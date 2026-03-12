const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus, updateGateStatus } = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getBookings);
router.post('/', protect, authorize('Requester'), createBooking);
router.put('/:id/status', protect, authorize('HR'), updateBookingStatus);
router.put('/:id/gate-status', protect, authorize('Security'), updateGateStatus);

module.exports = router;

