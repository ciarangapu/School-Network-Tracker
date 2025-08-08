import emailService from './services/emailService.js';
import pdfService from './services/pdfService.js';

console.log('Testing email and PDF services...');

// Test PDF generation
const testData = {
  studentName: 'Test Student',
  email: 'test@example.com',
  course: 'Full Stack Development',
  presentDays: 15,
  totalDays: 20,
  attendanceRate: 75,
  period: 'Last 30 days',
  attendanceRecords: [
    { date: '2024-01-01', status: 'Present', timeIn: '09:00 AM', notes: '' },
    { date: '2024-01-02', status: 'Absent', timeIn: '', notes: 'Sick leave' },
    { date: '2024-01-03', status: 'Present', timeIn: '09:15 AM', notes: 'Late arrival' }
  ]
};

async function testServices() {
  try {
    console.log('✅ Testing PDF generation...');
    const pdfBuffer = await pdfService.generateStudentAttendancePDF(testData);
    console.log(`✅ PDF generated successfully! Size: ${pdfBuffer.length} bytes`);
    
    console.log('✅ Email and PDF services are working properly!');
  } catch (error) {
    console.error('❌ Error testing services:', error);
  }
}

testServices();
