
const nodemailer = require('nodemailer');
// Load env vars - try to use dotenv if available, otherwise rely on system env
try {
    require('dotenv').config();
} catch (e) {
    console.log('dotenv not found, relying on system environment variables');
}

async function sendTestEmail() {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    console.log('Checking configuration...');
    console.log('MAIL_USER:', user ? user : '(not set)');
    console.log('MAIL_PASS:', pass ? '(set)' : '(not set)');

    if (!user || !pass) {
        console.error('ERROR: MAIL_USER or MAIL_PASS is missing in environment variables.');
        console.error('Please add them to your .env file.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass,
        },
    });

    console.log('Sending test email...');
    try {
        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`,
            to: user, // Send to self
            subject: 'Test Email from Debug Script',
            text: 'If you receive this, your email configuration is working!',
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Please check your inbox (and spam folder) for the test email.');
    } catch (error) {
        console.error('❌ Failed to send email.');
        console.error('Error details:', error.message);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Please check your Google App Password.');
        }
    }
}

sendTestEmail();
