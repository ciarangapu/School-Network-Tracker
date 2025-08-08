import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'undefined');

async function testEmail() {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('\n📧 Testing SMTP connection...');
    
    // Verify connection
    const verified = await transporter.verify();
    console.log('✅ SMTP connection verified:', verified);

    // Send test email
    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: {
        name: 'School Network Tracker Test',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Test Email from School Network Tracker',
      html: `
        <h2>✅ Email Configuration Test</h2>
        <p>If you're reading this, your email configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Server:</strong> ${process.env.EMAIL_HOST}</p>
        <p><strong>Port:</strong> ${process.env.EMAIL_PORT}</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

  } catch (error) {
    console.error('❌ Email test failed:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication Error:');
      console.error('- Make sure you\'re using an App Password, not your regular Gmail password');
      console.error('- Go to Google Account → Security → 2-Step Verification → App passwords');
      console.error('- Generate a new app password and use that instead');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🌐 Network Error:');
      console.error('- Check your internet connection');
      console.error('- Verify the SMTP host is correct');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🔌 Connection Error:');
      console.error('- Check if the port is correct (587 for TLS, 465 for SSL)');
      console.error('- Try setting EMAIL_SECURE=true and EMAIL_PORT=465');
    }
  }
}

testEmail();
