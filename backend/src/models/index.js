const { Sequelize, DataTypes } = require('sequelize');

console.log("DB_DIALECT==" + process.env.DB_DIALECT);
const useDbSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT,
        logging: false,
        dialectOptions: useDbSsl ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    }
);

const User = require('./User')(sequelize, DataTypes);
const Vehicle = require('./Vehicle')(sequelize, DataTypes);
const Booking = require('./Booking')(sequelize, DataTypes);
const AuditTrail = require('./AuditTrail')(sequelize, DataTypes);
const EmailConfig = require('./EmailConfig')(sequelize, DataTypes);

// Associations
User.hasMany(Booking, { foreignKey: 'requesterId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicleId', as: 'bookings' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

User.hasMany(AuditTrail, { foreignKey: 'userId', as: 'logs' });
AuditTrail.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    sequelize,
    User,
    Vehicle,
    Booking,
    AuditTrail,
    EmailConfig
};
