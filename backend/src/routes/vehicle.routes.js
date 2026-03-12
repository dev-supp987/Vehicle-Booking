const express = require('express');
const router = express.Router();
const { getVehicles, createVehicle, updateVehicleStatus, updateVehicle, deleteVehicle } = require('../controllers/vehicle.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getVehicles);
router.post('/', protect, authorize('HR'), createVehicle);
router.put('/:id', protect, authorize('HR'), updateVehicle);
router.delete('/:id', protect, authorize('HR'), deleteVehicle);
router.put('/:id/status', protect, authorize('HR', 'Security'), updateVehicleStatus);




module.exports = router;
