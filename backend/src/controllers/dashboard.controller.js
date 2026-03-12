const { Booking, Vehicle, User, AuditTrail, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        if (role === 'HR') {
            const totalVehicles = await Vehicle.count();
            const freeVehicles = await Vehicle.count({ where: { status: 'Available' } });
            const runningVehicles = await Vehicle.count({ where: { status: 'Running' } });
            const pendingRequests = await Booking.count({ where: { status: 'Pending' } });

            // Calculate total distance (sum of endKm - startKm)
            const bookingsWithDistance = await Booking.findAll({
                where: {
                    status: 'Returned',
                    startKm: { [Op.not]: null },
                    endKm: { [Op.not]: null }
                },
                attributes: ['startKm', 'endKm']
            });

            const totalDistance = bookingsWithDistance.reduce((sum, b) => sum + (b.endKm - b.startKm), 0);

            return res.json({
                totalVehicles,
                freeVehicles,
                runningVehicles,
                pendingRequests,
                totalDistance,
                role: 'HR'
            });
        }

        if (role === 'Requester') {
            const myPending = await Booking.count({ where: { requesterId: userId, status: 'Pending' } });
            const myApproved = await Booking.count({ where: { requesterId: userId, status: 'Approved' } });
            const myActive = await Booking.count({ where: { requesterId: userId, status: 'Running' } });
            const totalMyBookings = await Booking.count({ where: { requesterId: userId } });

            return res.json({
                myPending,
                myApproved,
                myActive,
                totalMyBookings,
                role: 'Requester'
            });
        }

        if (role === 'Security') {
            const todayStart = new Date().setHours(0, 0, 0, 0);
            const toDepart = await Booking.count({ where: { status: 'Approved' } });
            const currentlyOut = await Booking.count({ where: { status: 'Running' } });
            const totalTodayMovements = await AuditTrail.count({
                where: {
                    action: { [Op.or]: ['GATE_DEPARTED', 'GATE_RETURNED'] },
                    createdAt: { [Op.gte]: todayStart }
                }
            });

            return res.json({
                toDepart,
                currentlyOut,
                totalTodayMovements,
                role: 'Security'
            });
        }

        res.status(400).json({ message: 'Invalid role for stats' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUsageReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log(`[REPORTS API] Received query params:`, { startDate, endDate });

        let where = {};

        if (startDate && endDate) {
            where.startTime = {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            };
        } else if (startDate) {
            where.startTime = { [Op.gte]: startDate };
        } else if (endDate) {
            where.startTime = { [Op.lte]: endDate };
        }

        console.log(`[REPORTS API] Final Where Attributes:`, Object.keys(where));

        const report = await Booking.findAll({
            where,
            include: [
                { model: User, as: 'requester', attributes: ['name', 'department', 'employeeId'] },
                { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'model'] }
            ],
            order: [['startTime', 'DESC']],
            logging: (sql) => console.log(`[REPORTS SQL]: ${sql}`)
        });

        // DEBUG LOGGING
        const sample = report.find(r => r.id === 11);
        if (sample) {
            console.log(`[API DEBUG] Report ID 11: StartKM=${sample.startKm}, EndKM=${sample.endKm}`);
        } else {
            console.log('[API DEBUG] Report ID 11 NOT FOUND in result');
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecentActivities = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        let where = {};

        const cleanRole = role ? role.trim() : '';

        // Check for Security (handle potential whitespace or slight variations)
        const isSecurity = cleanRole === 'Security' || cleanRole === 'Security Guard';

        // Security only sees Gate, Booking, and Vehicle operations
        if (isSecurity) {
            where.action = {
                [Op.or]: [
                    { [Op.like]: '%GATE%' },
                    { [Op.like]: '%BOOKING%' },
                    { [Op.like]: '%VEHICLE%' },
                    { [Op.like]: '%DEPART%' },
                    { [Op.like]: '%RETURN%' }
                ]
            };
        }

        const logs = await AuditTrail.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['name', 'role'] }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
