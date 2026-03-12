module.exports = (sequelize, DataTypes) => {
    const Vehicle = sequelize.define('Vehicle', {
        plateNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Available', 'Reserved', 'Running', 'Arrived', 'Returned', 'Under Maintenance'),
            defaultValue: 'Available'
        },
        currentLocation: DataTypes.STRING
    });

    return Vehicle;
};
