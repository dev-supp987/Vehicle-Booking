require('dotenv').config();
const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const email = 'admin@company.com';
        // default admin

        let user = await User.findOne({ where: { email } });
        const hashedPassword = await bcrypt.hash('password123', 10);

        if (!user) {
            console.log('Admin not found. Creating new admin...');
            try {
                user = await User.create({
                    name: 'Admin User',
                    email: email,
                    password: hashedPassword,
                    role: 'HR',
                    department: 'HR',
                    mobileNumber: '9999999999',
                    employeeId: 'ADMIN999',
                    isActive: true
                });
                console.log('Admin created successfully with ID:', user.id);
            } catch (createError) {
                console.error('FAILED TO CREATE ADMIN:', createError);
                if (createError.name === 'SequelizeUniqueConstraintError') {
                    console.log('Unique constraint error. Checking conflicting fields...');
                }
            }
        } else {
            console.log('Admin found. resetting password...');
            user.password = hashedPassword;
            user.role = 'HR';
            user.isActive = true;
            await user.save();
            console.log('Admin updated.');
        }

        console.log(`Login with: ${email} / password123`);
        process.exit(0);
    } catch (error) {
        console.error('GLOBAL ERROR:', error);
        process.exit(1);
    }
}

resetAdmin();
