const { format } = require('date-fns');

const getEmailStyles = () => `
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
        .message { color: #555; line-height: 1.6; margin-bottom: 30px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
        .details-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .details-table td:first-child { font-weight: 600; color: #667eea; width: 40%; }
        .details-table td:last-child { color: #333; }
        .cta-button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 13px; }
        .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .status-approved { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-rejected { background: #f8d7da; color: #721c24; }
        .status-departed { background: #d1ecf1; color: #0c5460; }
        .status-returned { background: #d4edda; color: #155724; }
    </style>
`;

// Booking Confirmation (to requester)
exports.bookingConfirmation = (booking, user, vehicle) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${getEmailStyles()}
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🚗 Booking Confirmed</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello ${user.name},</div>
            <div class="message">
                Your vehicle booking request has been successfully submitted and is now <span class="status-badge status-pending">Pending Approval</span>.
            </div>
            <table class="details-table">
                <tr><td>Booking ID</td><td>#${booking.id}</td></tr>
                <tr><td>Vehicle</td><td>${vehicle.model} (${vehicle.plateNumber})</td></tr>
                <tr><td>Pickup Location</td><td>${booking.pickupLocation}</td></tr>
                <tr><td>Drop Location</td><td>${booking.dropLocation}</td></tr>
                <tr><td>Start Time</td><td>${format(new Date(booking.startTime), 'PPpp')}</td></tr>
                <tr><td>End Time</td><td>${format(new Date(booking.endTime), 'PPpp')}</td></tr>
                <tr><td>Purpose</td><td>${booking.purpose}</td></tr>
                <tr><td>Booking Type</td><td>${booking.bookingType}</td></tr>
            </table>
            <div class="message">
                You will receive another email once your booking is approved by the administrator.
            </div>
        </div>
        <div class="footer">
            Vehicle Booking System | Automated Notification<br>
            Please do not reply to this email.
        </div>
    </div>
</body>
</html>
    `;
};

// Booking Approved (to requester + security)
exports.bookingApproved = (booking, user, vehicle, isSecurityGuard = false) => {
    const greeting = isSecurityGuard ? 'Security Team' : user.name;
    const message = isSecurityGuard
        ? `A vehicle booking has been approved. Please facilitate the vehicle departure.`
        : `Great news! Your vehicle booking has been <span class="status-badge status-approved">Approved</span>.`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${getEmailStyles()}
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✅ Booking Approved</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello ${greeting},</div>
            <div class="message">${message}</div>
            <table class="details-table">
                <tr><td>Booking ID</td><td>#${booking.id}</td></tr>
                <tr><td>Requester</td><td>${user.name} (${user.employeeId})</td></tr>
                <tr><td>Department</td><td>${user.department || 'N/A'}</td></tr>
                <tr><td>Vehicle</td><td>${vehicle.model} (${vehicle.plateNumber})</td></tr>
                <tr><td>Pickup Location</td><td>${booking.pickupLocation}</td></tr>
                <tr><td>Drop Location</td><td>${booking.dropLocation}</td></tr>
                <tr><td>Start Time</td><td>${format(new Date(booking.startTime), 'PPpp')}</td></tr>
                <tr><td>End Time</td><td>${format(new Date(booking.endTime), 'PPpp')}</td></tr>
                <tr><td>Purpose</td><td>${booking.purpose}</td></tr>
                <tr><td>Passengers</td><td>${booking.passengers}</td></tr>
            </table>
            ${isSecurityGuard ?
            '<div class="message">Please record the vehicle odometer reading when the vehicle departs.</div>' :
            '<div class="message">Your vehicle is ready. Please proceed to the pickup location at the scheduled time.</div>'}
        </div>
        <div class="footer">
            Vehicle Booking System | Automated Notification<br>
            Please do not reply to this email.
        </div>
    </div>
</body>
</html>
    `;
};

// Booking Rejected (to requester)
exports.bookingRejected = (booking, user, vehicle, rejectionReason) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${getEmailStyles()}
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>❌ Booking Not Approved</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello ${user.name},</div>
            <div class="message">
                Unfortunately, your vehicle booking request has been <span class="status-badge status-rejected">Rejected</span>.
            </div>
            <table class="details-table">
                <tr><td>Booking ID</td><td>#${booking.id}</td></tr>
                <tr><td>Vehicle</td><td>${vehicle.model} (${vehicle.plateNumber})</td></tr>
                <tr><td>Requested Dates</td><td>${format(new Date(booking.startTime), 'PPpp')} to ${format(new Date(booking.endTime), 'PPpp')}</td></tr>
                <tr><td>Reason</td><td>${rejectionReason || 'Not specified'}</td></tr>
            </table>
            <div class="message">
                If you have any questions, please contact the administrator.
            </div>
        </div>
        <div class="footer">
            Vehicle Booking System | Automated Notification<br>
            Please do not reply to this email.
        </div>
    </div>
</body>
</html>
    `;
};

// Vehicle Departed (to requester + admin)
exports.vehicleDeparted = (booking, user, vehicle, isAdmin = false) => {
    const greeting = isAdmin ? 'Admin' : user.name;
    const message = isAdmin
        ? `A vehicle has <span class="status-badge status-departed">Departed</span> for a booking.`
        : `Your vehicle has <span class="status-badge status-departed">Departed</span>. Have a safe journey!`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${getEmailStyles()}
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🚘 Vehicle Departed</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello ${greeting},</div>
            <div class="message">
                ${message}
            </div>
            <table class="details-table">
                <tr><td>Booking ID</td><td>#${booking.id}</td></tr>
                <tr><td>Requester</td><td>${user.name} (${user.employeeId})</td></tr>
                <tr><td>Vehicle</td><td>${vehicle.model} (${vehicle.plateNumber})</td></tr>
                <tr><td>Start KM</td><td>${booking.startKm || 'Not recorded'}</td></tr>
                <tr><td>Departure Time</td><td>${format(new Date(), 'PPpp')}</td></tr>
                <tr><td>Expected Return</td><td>${format(new Date(booking.endTime), 'PPpp')}</td></tr>
                <tr><td>Destination</td><td>${booking.dropLocation}</td></tr>
            </table>
        </div>
        <div class="footer">
            Vehicle Booking System | Automated Notification<br>
            Please do not reply to this email.
        </div>
    </div>
</body>
</html>
    `;
};

// Vehicle Returned (to requester + admin)
exports.vehicleReturned = (booking, user, vehicle, isAdmin = false) => {
    const greeting = isAdmin ? 'Admin' : user.name;
    const distance = (booking.startKm && booking.endKm) ? (booking.endKm - booking.startKm) : 'N/A';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${getEmailStyles()}
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✅ Trip Completed</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello ${greeting},</div>
            <div class="message">
                The vehicle has been <span class="status-badge status-returned">Returned</span> and the booking is now complete.
            </div>
            <table class="details-table">
                <tr><td>Booking ID</td><td>#${booking.id}</td></tr>
                <tr><td>Requester</td><td>${user.name} (${user.employeeId})</td></tr>
                <tr><td>Vehicle</td><td>${vehicle.model} (${vehicle.plateNumber})</td></tr>
                <tr><td>Start KM</td><td>${booking.startKm || 'N/A'}</td></tr>
                <tr><td>End KM</td><td>${booking.endKm || 'N/A'}</td></tr>
                <tr><td>Total Distance</td><td>${distance} km</td></tr>
                <tr><td>Return Time</td><td>${format(new Date(), 'PPpp')}</td></tr>
                <tr><td>Duration</td><td>${((new Date(booking.endTime) - new Date(booking.startTime)) / 3600000).toFixed(1)} hours</td></tr>
            </table>
            <div class="message">
                Thank you for using the Vehicle Booking System.
            </div>
        </div>
        <div class="footer">
            Vehicle Booking System | Automated Notification<br>
            Please do not reply to this email.
        </div>
    </div>
</body>
</html>
    `;
};
