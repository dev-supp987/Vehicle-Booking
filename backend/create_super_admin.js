require('dotenv').config();
const { User, sequelize } = require('./src/models');

const promoteToSuperAdmin = async (email) => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');


        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }

        user.isSuperAdmin = true;
        // Example permissions, though SuperAdmin bypasses checks.
        // We set them just in case specific UI logic relies on them.
        user.permissions = {
            canManageBookings: true,
            canViewReports: true,
            canManageUsers: true,
            canManageSystem: true
        };

        await user.save();
        console.log(`SUCCESS: User ${user.name} (${user.email}) is now a SUPER ADMIN.`);

    } catch (error) {
        console.error('Error promoting user:', error);
    } finally {
        await sequelize.close();
    }
};

// Replace with the actual email you want to promote
const targetEmail = 'admin@example.com';

// Check if email is passed as argument
const args = process.argv.slice(2);
const emailToPromote = args[0] || targetEmail;

promoteToSuperAdmin(emailToPromote);
