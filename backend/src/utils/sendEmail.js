// utils/sendEmail.js
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production email service (SendGrid, Mailgun, etc.)
        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD,
            },
        });
    }

    // Development email service (Ethereal for testing)
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_EMAIL || 'your-email@ethereal.email',
            pass: process.env.SMTP_PASSWORD || 'your-password',
        },
    });
};

const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Resume Builder" <${process.env.FROM_EMAIL || 'noreply@resumebuilder.com'}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            // Optional text version for email clients that don't support HTML
            text: options.text || options.html.replace(/<[^>]*>/g, ''),
        };

        // In development, log the email instead of sending
        if (process.env.NODE_ENV === 'development' && !process.env.SMTP_EMAIL) {
            console.log('=== EMAIL WOULD BE SENT ===');
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('HTML:', options.html);
            console.log('===========================');

            // Get test email URL from Ethereal
            const testAccount = await nodemailer.createTestAccount();
            console.log('Test emails available at: https://ethereal.email/');
            return;
        }

        const info = await transporter.sendMail(mailOptions);

        if (process.env.NODE_ENV === 'development') {
            console.log('Email sent:', info.messageId);
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send email');
    }
};

export default sendEmail;