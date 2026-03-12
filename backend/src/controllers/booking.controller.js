const { Booking, Vehicle, User, AuditTrail, sequelize } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');

exports.createBooking = async (req, res) => {
    try {
        const { startTime, endTime, purpose, pickupLocation, dropLocation, passengers, priority, bookingType } = req.body;

        // Soft validation for time-slot conflict (optional if we want to allow overlapping requests before approval)
        // But let's keep it simple for now.

        const booking = await Booking.create({
            startTime,
            endTime,
            purpose,
            pickupLocation,
            dropLocation,
            passengers,
            priority,
            bookingType,
            requesterId: req.user.id,
            status: 'Pending'
        });

        await AuditTrail.create({
            action: 'BOOKING_CREATED',
            details: `Booking #${booking.id} created by ${req.user.name}`,
            userId: req.user.id
        });

        // Send confirmation email
        const bookingWithDetails = await Booking.findByPk(booking.id, {
            include: [
                { model: User, as: 'requester' },
                { model: Vehicle, as: 'vehicle' }
            ]
        });
        if (bookingWithDetails.requester && bookingWithDetails.vehicle) {
            emailService.sendBookingConfirmation(
                bookingWithDetails,
                bookingWithDetails.requester,
                bookingWithDetails.vehicle
            ).catch(err => console.error('[Email] Failed to send confirmation:', err));
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const where = req.user.role === 'Requester' ? { requesterId: req.user.id } : {};
        const bookings = await Booking.findAll({
            where,
            include: [
                { model: User, as: 'requester', attributes: ['name', 'department', 'mobileNumber', 'employeeId', 'email'] },
                { model: Vehicle, as: 'vehicle', attributes: ['plateNumber', 'model'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, remarks, vehicleId } = req.body;
        const booking = await Booking.findByPk(id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (status === 'Approved' && !vehicleId) {
            return res.status(400).json({ message: 'Vehicle allocation is required for approval' });
        }

        booking.status = status;
        booking.remarks = remarks;
        if (vehicleId) {
            booking.vehicleId = vehicleId;
            // Update vehicle status to Reserved
            const vehicle = await Vehicle.findByPk(vehicleId);
            vehicle.status = 'Reserved';
            await vehicle.save({ transaction });
        }

        await booking.save({ transaction });

        await AuditTrail.create({
            action: `BOOKING_${status.toUpperCase()}`,
            details: `Booking #${booking.id} ${status.toLowerCase()} by ${req.user.name}. ${remarks ? 'Remarks: ' + remarks : ''}`,
            userId: req.user.id
        }, { transaction });

        await transaction.commit();

        // Send email notifications after transaction commits
        const bookingWithDetails = await Booking.findByPk(booking.id, {
            include: [
                { model: User, as: 'requester' },
                { model: Vehicle, as: 'vehicle' }
            ]
        });

        if (status === 'Approved' && bookingWithDetails.requester && bookingWithDetails.vehicle) {
            emailService.sendBookingApproved(
                bookingWithDetails,
                bookingWithDetails.requester,
                bookingWithDetails.vehicle
            ).catch(err => console.error('[Email] Failed to send approval:', err));
        } else if (status === 'Rejected' && bookingWithDetails.requester && bookingWithDetails.vehicle) {
            emailService.sendBookingRejected(
                bookingWithDetails,
                bookingWithDetails.requester,
                bookingWithDetails.vehicle,
                remarks
            ).catch(err => console.error('[Email] Failed to send rejection:', err));
        }

        res.json(booking);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

exports.updateGateStatus = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { gateStatus, startKm, endKm } = req.body; // 'Arrived', 'Departed', 'Returned'
        console.log(`[GateStatus] Update for Booking ${id}: Status=${gateStatus}, StartKM=${startKm}, EndKM=${endKm}`);

        const booking = await Booking.findByPk(id, { include: ['vehicle'] });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (!booking.vehicle) return res.status(400).json({ message: 'No vehicle allocated to this booking' });

        const vehicle = booking.vehicle;
        let details = '';

        if (gateStatus === 'Arrived') {
            vehicle.status = 'Arrived';
            details = `Vehicle ${vehicle.plateNumber} arrived at gate.`;
        } else if (gateStatus === 'Departed') {
            vehicle.status = 'Running';
            booking.status = 'Running';

            if (startKm !== undefined && startKm !== null) {
                booking.startKm = parseInt(startKm);
                if (isNaN(booking.startKm)) {
                    console.warn(`[GateStatus] Invalid StartKM received: ${startKm}`);
                    booking.startKm = null;
                }
            } else {
                console.warn(`[GateStatus] StartKM is missing on departure for booking ${id}`);
            }

            details = `Vehicle ${vehicle.plateNumber} departed. Start KM: ${booking.startKm || 'N/A'}`;
        } else if (gateStatus === 'Returned') {
            vehicle.status = 'Available';
            booking.status = 'Returned';

            if (endKm !== undefined && endKm !== null) {
                booking.endKm = parseInt(endKm);
                if (isNaN(booking.endKm)) {
                    console.warn(`[GateStatus] Invalid EndKM received: ${endKm}`);
                    booking.endKm = null;
                }
            } else {
                console.warn(`[GateStatus] EndKM is missing on return for booking ${id}`);
            }

            const distance = (booking.startKm !== null && booking.endKm !== null) ? (booking.endKm - booking.startKm) : 'N/A';
            details = `Vehicle ${vehicle.plateNumber} returned. End KM: ${booking.endKm || 'N/A'}. Total: ${distance} km`;
        }

        await vehicle.save({ transaction });
        await booking.save({ transaction });

        await AuditTrail.create({
            action: `GATE_${gateStatus.toUpperCase()}`,
            details: `Gate security marked booking #${booking.id} as ${gateStatus}. ${details}`,
            userId: req.user.id
        }, { transaction });

        await transaction.commit();

        // Send email notifications after transaction commits
        const bookingWithDetails = await Booking.findByPk(booking.id, {
            include: [
                { model: User, as: 'requester' },
                { model: Vehicle, as: 'vehicle' }
            ]
        });

        if (gateStatus === 'Departed' && bookingWithDetails.requester && bookingWithDetails.vehicle) {
            emailService.sendVehicleDeparted(
                bookingWithDetails,
                bookingWithDetails.requester,
                bookingWithDetails.vehicle
            ).catch(err => console.error('[Email] Failed to send departure notification:', err));
        } else if (gateStatus === 'Returned' && bookingWithDetails.requester && bookingWithDetails.vehicle) {
            emailService.sendVehicleReturned(
                bookingWithDetails,
                bookingWithDetails.requester,
                bookingWithDetails.vehicle
            ).catch(err => console.error('[Email] Failed to send return notification:', err));
        }

        res.json({ booking, vehicle });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

