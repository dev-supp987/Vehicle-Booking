module.exports = (sequelize, DataTypes) => {
    const AuditTrail = sequelize.define('AuditTrail', {
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        details: DataTypes.TEXT,
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    return AuditTrail;
};
