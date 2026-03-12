const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EmailConfig = sequelize.define('EmailConfig', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        adminEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        securityEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        ccEmails: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Comma-separated CC email addresses'
        },
        emailEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        smtpHost: {
            type: DataTypes.STRING,
            allowNull: true
        },
        smtpPort: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 587
        },
        smtpUser: {
            type: DataTypes.STRING,
            allowNull: true
        },
        smtpPassword: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fromEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        fromName: {
            type: DataTypes.STRING,
            defaultValue: 'Vehicle Booking System'
        }
    }, {
        tableName: 'email_configs',
        timestamps: true
    });

    return EmailConfig;
};
