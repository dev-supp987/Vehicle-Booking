require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log("DB_DIALECT11==" + process.env.DB_DIALECT);
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

console.log("Server starting11");

debugger;

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Vehicle Booking System API is running' });
});

// Auth Routes
app.use('/api/auth', require('./routes/auth.routes'));
// Booking Routes
app.use('/api/bookings', require('./routes/booking.routes'));
// Vehicle Routes
app.use('/api/vehicles', require('./routes/vehicle.routes'));
// Dashboard Routes
app.use('/api/dashboard', require('./routes/dashboard.routes'));
// Maintenance Routes
app.use('/api/maintenance', require('./routes/maintenance.routes'));
// Email Routes
app.use('/api/email', require('./routes/email.routes'));

// TEMPORARY: Seed Route for Cloud Deployment
app.get('/api/seed', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { sequelize, User, Vehicle } = require('./models');
        console.log('Starting remote seed...');

        await sequelize.sync({ force: true });
        console.log('Database cleared.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        await User.bulkCreate([
            { name: 'Admin User', email: 'admin@company.com', password: hashedPassword, role: 'HR', department: 'HR', mobileNumber: '1234567890', employeeId: 'HR001' },
            { name: 'Employee User', email: 'employee@company.com', password: hashedPassword, role: 'Requester', department: 'Marketing', mobileNumber: '0987654321', employeeId: 'EMP101' },
            { name: 'Security Guard', email: 'security@company.com', password: hashedPassword, role: 'Security', department: 'Security', mobileNumber: '1122334455', employeeId: 'SEC99' }
        ]);

        await Vehicle.bulkCreate([
            { plateNumber: 'ABC-1234', model: 'Toyota Innova', status: 'Available', currentLocation: 'Main Garage' },
            { plateNumber: 'XYZ-5678', model: 'Honda City', status: 'Available', currentLocation: 'Main Garage' },
            { plateNumber: 'MNO-9012', model: 'Mahindra XUV700', status: 'Available', currentLocation: 'Main Garage' },
            { plateNumber: 'DEF-3456', model: 'Tata Safari', status: 'Under Maintenance', currentLocation: 'Service Center' }
        ]);

        console.log('Seed complete.');
        res.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Seed failed:', error);
        res.status(500).json({ error: error.message });
    }
});


// Database Sync & Server Start
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        await sequelize.authenticate();
        console.log('Database connection established successfully11.');

        await sequelize.sync();
        console.log('Database synced');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
};

startServer();
