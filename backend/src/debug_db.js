const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Booking, User, Vehicle } = require('./models');
const { Op } = require('sequelize');

async function check() {
    try {
        console.log('--- DATABASE DIAGNOSTIC ---');
        const count = await Booking.count();
        console.log('Total Bookings:', count);

        const now = new Date();
        const startToday = new Date(now);
        startToday.setHours(0, 0, 0, 0);
        const endToday = new Date(now);
        endToday.setHours(23, 59, 59, 999);

        console.log('Filtering Today:', startToday.toISOString(), 'to', endToday.toISOString());

        const todayBookings = await Booking.findAll({
            where: {
                startTime: {
                    [Op.between]: [startToday, endToday]
                }
            }
        });

        console.log('Found Today:', todayBookings.length);
        if (todayBookings.length > 0) {
            todayBookings.forEach(b => console.log(` - ID: ${b.id}, Start: ${b.startTime}`));
        }

        const last5 = await Booking.findAll({
            limit: 5,
            order: [['startTime', 'DESC']],
            include: [{ model: User, as: 'requester', attributes: ['name'] }]
        });
        console.log('\nLast 5 Bookings:');
        last5.forEach(b => console.log(` - ID: ${b.id}, Start: ${b.startTime}, Requester: ${b.requester?.name}`));

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

check();
