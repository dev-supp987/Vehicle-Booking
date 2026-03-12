module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('Requester', 'HR', 'Security'),
            defaultValue: 'Requester'
        },
        department: DataTypes.STRING,
        mobileNumber: DataTypes.STRING,
        employeeId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isSuperAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        permissions: {
            type: DataTypes.JSON,
            defaultValue: {}
            // Example: { canManageBookings: true, canViewReports: true, canManageUsers: true }
        }
    });

    return User;
};
