const { EmailConfig } = require('../models');
const emailService = require('../services/email.service');

// Get email configuration
exports.getEmailConfig = async (req, res) => {
    try {
        let config = await EmailConfig.findOne();

        // Create default config if none exists
        if (!config) {
            config = await EmailConfig.create({
                emailEnabled: false,
                smtpPort: 587,
                fromName: 'Vehicle Booking System'
            });
        }

        // Don't send password in response
        const safeConfig = { ...config.toJSON() };
        delete safeConfig.smtpPassword;

        res.json(safeConfig);
    } catch (error) {
        console.error('Get email config error:', error);
        res.status(500).json({ message: 'Failed to fetch email configuration' });
    }
};

// Update email configuration
exports.updateEmailConfig = async (req, res) => {
    try {
        const {
            adminEmail,
            securityEmail,
            ccEmails,
            emailEnabled,
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPassword,
            fromEmail,
            fromName
        } = req.body;

        let config = await EmailConfig.findOne();

        if (!config) {
            // Create new config
            config = await EmailConfig.create({
                adminEmail,
                securityEmail,
                ccEmails,
                emailEnabled,
                smtpHost,
                smtpPort,
                smtpUser,
                smtpPassword,
                fromEmail,
                fromName
            });
        } else {
            // Update existing config
            await config.update({
                adminEmail,
                securityEmail,
                ccEmails,
                emailEnabled,
                smtpHost,
                smtpPort,
                smtpUser,
                // Only update password if provided
                ...(smtpPassword ? { smtpPassword } : {}),
                fromEmail,
                fromName
            });
        }

        // Reload email service config
        await emailService.loadConfig();

        // Don't send password in response
        const safeConfig = { ...config.toJSON() };
        delete safeConfig.smtpPassword;

        res.json({
            message: 'Email configuration updated successfully',
            config: safeConfig
        });
    } catch (error) {
        console.error('Update email config error:', error);
        res.status(500).json({ message: 'Failed to update email configuration' });
    }
};

// Send test email
exports.sendTestEmail = async (req, res) => {
    try {
        const { testEmail } = req.body;

        if (!testEmail) {
            return res.status(400).json({ message: 'Test email address is required' });
        }

        // Load current config
        await emailService.loadConfig();

        // Send test email
        const result = await emailService.sendTestEmail(testEmail);

        if (result.success) {
            res.json({ message: 'Test email sent successfully', messageId: result.messageId });
        } else {
            res.status(500).json({ message: result.message || result.error || 'Failed to send test email' });
        }
    } catch (error) {
        console.error('Send test email error:', error);
        res.status(500).json({ message: 'Failed to send test email' });
    }
};
