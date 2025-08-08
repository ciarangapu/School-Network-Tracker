// Simple test to check email configuration
console.log('🔍 Checking email environment variables...');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE || 'NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? `SET (${process.env.EMAIL_PASSWORD.length} chars)` : 'NOT SET');

// Check if the values look correct
const issues = [];

if (!process.env.EMAIL_USER) issues.push('EMAIL_USER not set');
if (!process.env.EMAIL_PASSWORD) issues.push('EMAIL_PASSWORD not set');
if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.includes(' ')) {
  issues.push('EMAIL_PASSWORD contains spaces (remove them)');
}
if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.length !== 16) {
  issues.push(`EMAIL_PASSWORD length is ${process.env.EMAIL_PASSWORD.length}, should be 16 for Gmail app passwords`);
}

if (issues.length > 0) {
  console.log('\n❌ Issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('\n✅ Basic configuration looks good');
}

console.log('\n📋 Gmail App Password Setup Instructions:');
console.log('1. Go to your Google Account settings');
console.log('2. Security → 2-Step Verification (must be enabled)');
console.log('3. App passwords → Generate new app password');
console.log('4. Select "Mail" as the app');
console.log('5. Copy the 16-character password (no spaces)');
console.log('6. Use that password in EMAIL_PASSWORD=xxxxx');
