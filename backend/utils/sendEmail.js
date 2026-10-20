const nodemailer = require('nodemailer');

const sendEmail = async options => {
    const requiredConfig = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'];
    const missingConfig = requiredConfig.filter(key => !process.env[key]);
    if (missingConfig.length) {
        throw new Error(`Email is not configured. Missing: ${missingConfig.join(', ')}`);
    }

    const port = Number(process.env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('SMTP_PORT must be a valid TCP port.');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME || 'GuhitSpace'} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html || `<p>${options.message}</p>`,
        attachments: options.attachments || []
    }

    await transporter.sendMail(message)
}

module.exports = sendEmail;