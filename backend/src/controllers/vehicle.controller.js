const { Vehicle, AuditTrail } = require('../models');

exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        await AuditTrail.create({
            action: 'VEHICLE_CREATED',
            details: `Vehicle ${vehicle.plateNumber} added to fleet`,
            userId: req.user.id
        });
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateVehicleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        vehicle.status = status;
        await vehicle.save();

        await AuditTrail.create({
            action: 'VEHICLE_STATUS_UPDATED',
            details: `Vehicle ${vehicle.plateNumber} status changed to ${status}`,
            userId: req.user.id
        });

        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        await vehicle.update(req.body);

        await AuditTrail.create({
            action: 'VEHICLE_UPDATED',
            details: `Vehicle ${vehicle.plateNumber} details updated`,
            userId: req.user.id
        });

        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        await AuditTrail.create({
            action: 'VEHICLE_DELETED',
            details: `Vehicle ${vehicle.plateNumber} removed from fleet`,
            userId: req.user.id
        });

        await vehicle.destroy();
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
