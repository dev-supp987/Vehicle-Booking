const nodemailer = require('nodemailer');
const { EmailConfig } = require('../models');
const emailTemplates = require('./email.templates');

class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
    }

    async loadConfig() {
        try {
            // Get the first (and only) email config record
            this.config = await EmailConfig.findOne();

            if (!this.config || !this.config.emailEnabled) {
                console.log('[Email Service] Email notifications are disabled');
                return false;
            }

            // Create transporter with config
            this.transporter = nodemailer.createTransport({
                host: this.config.smtpHost,
                port: this.config.smtpPort,
                secure: this.config.smtpPort === 465,
                auth: {
                    user: this.config.smtpUser,
                    pass: this.config.smtpPassword
                }
            });

            return true;
        } catch (error) {
            console.error('[Email Service] Failed to load config:', error);
            return false;
        }
    }

    async sendEmail(to, subject, htmlContent) {
        try {
            // Load config if not already loaded
            if (!this.transporter) {
                const loaded = await this.loadConfig();
                if (!loaded) {
                    console.log('[Email Service] Skipping email - service not configured');
                    return { success: false, message: 'Email service not configured' };
                }
            }

            const mailOptions = {
                from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
                to: to,
                subject: subject,
                html: htmlContent
            };

            // Add CC if configured
            if (this.config.ccEmails) {
                mailOptions.cc = this.config.ccEmails;
            }

            const info = await this.transporter.sendMail(mailOptions);
            console.log('[Email Service] Email sent:', info.messageId, 'to:', to);

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('[Email Service] Failed to send email:', error);
            return { success: false, error: error.message };
        }
    }

    // Notification methods
    async sendBookingConfirmation(booking, user, vehicle) {
        const html = emailTemplates.bookingConfirmation(booking, user, vehicle);
        return await this.sendEmail(
            user.email,
            `Booking Confirmation - #${booking.id}`,
            html
        );
    }

    async sendBookingApproved(booking, user, vehicle) {
        const html = emailTemplates.bookingApproved(booking, user, vehicle, false);
        const results = [];

        // Send to requester
        if (user.email) {
            results.push(await this.sendEmail(
                user.email,
                `Booking Approved - #${booking.id}`,
                html
            ));
        }

        // Send to security guard
        if (this.config && this.config.securityEmail) {
            const securityHtml = emailTemplates.bookingApproved(booking, user, vehicle, true);
            results.push(await this.sendEmail(
                this.config.securityEmail,
                `New Approved Booking - #${booking.id}`,
                securityHtml
            ));
        }

        return results;
    }

    async sendBookingRejected(booking, user, vehicle, reason) {
        const html = emailTemplates.bookingRejected(booking, user, vehicle, reason);
        return await this.sendEmail(
            user.email,
            `Booking Rejected - #${booking.id}`,
            html
        );
    }

    async sendVehicleDeparted(booking, user, vehicle) {
        const results = [];

        // Send to requester
        if (user.email) {
            const html = emailTemplates.vehicleDeparted(booking, user, vehicle, false);
            results.push(await this.sendEmail(
                user.email,
                `Your Trip has Started - #${booking.id}`,
                html
            ));
        }

        // Send to admin
        if (this.config && this.config.adminEmail) {
            const adminHtml = emailTemplates.vehicleDeparted(booking, user, vehicle, true);
            results.push(await this.sendEmail(
                this.config.adminEmail,
                `Vehicle Departed - #${booking.id}`,
                adminHtml
            ));
        }

        return results;
    }

    async sendVehicleReturned(booking, user, vehicle) {
        const results = [];

        // Send to requester
        if (user.email) {
            const html = emailTemplates.vehicleReturned(booking, user, vehicle, false);
            results.push(await this.sendEmail(
                user.email,
                `Trip Completed - #${booking.id}`,
                html
            ));
        }

        // Send to admin
        if (this.config && this.config.adminEmail) {
            const adminHtml = emailTemplates.vehicleReturned(booking, user, vehicle, true);
            results.push(await this.sendEmail(
                this.config.adminEmail,
                `Vehicle Returned - #${booking.id}`,
                adminHtml
            ));
        }

        return results;
    }

    // Test email
    async sendTestEmail(toEmail) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
                    .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; text-align: center; }
                    h1 { color: #667eea; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Email Configuration Successful!</h1>
                    <p>This is a test email from the Vehicle Booking System.</p>
                    <p>Your email settings are working correctly.</p>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail(toEmail, 'Test Email - Vehicle Booking System', html);
    }
}

// Export singleton instance
module.exports = new EmailService();
