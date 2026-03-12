const { Booking, AuditTrail, Vehicle, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.clearOldData = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Delete old Audit Logs
        const deletedLogs = await AuditTrail.destroy({
            where: {
                createdAt: { [Op.lt]: sevenDaysAgo }
            }
        }, { transaction });

        // 2. Delete old Bookings (only those that are Returned or Rejected)
        const deletedBookings = await Booking.destroy({
            where: {
                createdAt: { [Op.lt]: sevenDaysAgo },
                status: { [Op.or]: ['Returned', 'Rejected'] }
            }
        }, { transaction });

        await AuditTrail.create({
            action: 'SYSTEM_MAINTENANCE',
            details: `Database cleanup performed. Deleted ${deletedLogs} logs and ${deletedBookings} old bookings.`,
            userId: req.user.id
        }, { transaction });

        await transaction.commit();
        res.json({
            message: 'Maintenance completed successfully',
            details: { deletedLogs, deletedBookings }
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

exports.resetVehicles = async (req, res) => {
    try {
        await Vehicle.update({ status: 'Available' }, { where: {} });

        await AuditTrail.create({
            action: 'SYSTEM_MAINTENANCE',
            details: `All vehicles reset to 'Available' status by developer.`,
            userId: req.user.id
        });

        res.json({ message: 'All vehicles have been reset to Available' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllLogs = async (req, res) => {
    try {
        const { action, startDate, endDate } = req.query;
        let where = {};

        if (action) {
            where.action = action;
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const logs = await AuditTrail.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['name', 'role', 'employeeId'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
