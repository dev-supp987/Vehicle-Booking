require('dotenv').config();

// FORCE CONFIG FOR SEEDING
process.env.DB_HOST = 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com';
process.env.DB_PORT = '4000';
process.env.DB_USER = '3zu3SZmrjtyuYzV.root';
process.env.DB_PASS = '0rY3vV9zAFEsnAvC';
process.env.DB_NAME = 'test';
process.env.DB_SSL = 'true';
process.env.DB_DIALECT = 'mysql';

const { sequelize, User, Vehicle } = require('./models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('Seed Config:', {
            HOST: process.env.DB_HOST,
            USER: process.env.DB_USER,
            DB: process.env.DB_NAME
        });
        await sequelize.sync({ force: true });
        console.log('Database cleared for seeding...');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Users
        await User.bulkCreate([
            { name: 'Admin User', email: 'admin@company.com', password: hashedPassword, role: 'HR', department: 'HR', mobileNumber: '1234567890', employeeId: 'HR001' },
            { name: 'Employee User', email: 'employee@company.com', password: hashedPassword, role: 'Requester', department: 'Marketing', mobileNumber: '0987654321', employeeId: 'EMP101' },
            { name: 'Security Guard', email: 'security@company.com', password: hashedPassword, role: 'Security', department: 'Security', mobileNumber: '1122334455', employeeId: 'SEC99' }
        ]);

        // Vehicles
        await Vehicle.bulkCreate([
            { plateNumber: 'ABC-1234', model: 'Toyota Innova', status: 'Available', currentLocation: 'Main Garage' },
            { plateNumber: 'XYZ-5678', model: 'Honda City', status: 'Available', currentLocation: 'Main Garage' },
            { plateNumber: 'MNO-9012', model: 'Mahindra XUV700', status: 'Available', currentLocation: 'Main Garage' },
            { plateNumber: 'DEF-3456', model: 'Tata Safari', status: 'Under Maintenance', currentLocation: 'Service Center' }
        ]);

        console.log('Seeding complete! Roles: HR, Requester, Security. Password: password123');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
