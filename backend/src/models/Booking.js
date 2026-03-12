module.exports = (sequelize, DataTypes) => {
    const Booking = sequelize.define('Booking', {
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        purpose: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        pickupLocation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dropLocation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        passengers: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        priority: {
            type: DataTypes.ENUM('Normal', 'Urgent'),
            defaultValue: 'Normal'
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled', 'Running', 'Returned'),
            defaultValue: 'Pending'
        },
        bookingType: {
            type: DataTypes.ENUM('Personal', 'Official', 'Guest'),
            defaultValue: 'Official'
        },
        startKm: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        endKm: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        remarks: DataTypes.TEXT
    });

    return Booking;
};
