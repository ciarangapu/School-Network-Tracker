import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  // Initialize email transporter with SMTP settings
  async initialize(emailConfig) {
    try {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host || 'smtp.gmail.com',
        port: emailConfig.port || 587,
        secure: emailConfig.secure || false,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      return false;
    }
  }

  // Send attendance report via email
  async sendAttendanceReport(recipientEmail, attendanceData, reportType = 'individual') {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const htmlContent = this.generateAttendanceEmailHTML(attendanceData, reportType);
      
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'School Network Tracker'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@schooltracker.com'}>`,
        to: recipientEmail,
        subject: `Attendance Report - ${reportType === 'individual' ? attendanceData.studentName : 'Class Summary'}`,
        html: htmlContent,
        attachments: []
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  // Send attendance report with PDF attachment
  async sendAttendanceReportWithPDF(recipientEmail, attendanceData, pdfBuffer, reportType = 'individual') {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const htmlContent = this.generateAttendanceEmailHTML(attendanceData, reportType);
      
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'School Network Tracker'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@schooltracker.com'}>`,
        to: recipientEmail,
        subject: `Attendance Report - ${reportType === 'individual' ? attendanceData.studentName : 'Class Summary'}`,
        html: htmlContent,
        attachments: [
          {
            filename: `attendance-report-${Date.now()}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email with PDF sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send email with PDF:', error);
      throw error;
    }
  }

  // Generate HTML content for attendance email
  generateAttendanceEmailHTML(attendanceData, reportType) {
    const { studentName, attendanceRate, presentDays, totalDays, period, course } = attendanceData;

    if (reportType === 'individual') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #3B82F6; }
            .stat-label { color: #666; }
            .status { padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 5px; }
            .present { background: #10B981; color: white; }
            .absent { background: #EF4444; color: white; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Attendance Report</h1>
              <p>Student: ${studentName}</p>
              <p>Course: ${course}</p>
              <p>Period: ${period}</p>
            </div>
            <div class="content">
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">${attendanceRate}%</div>
                  <div class="stat-label">Attendance Rate</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${presentDays}</div>
                  <div class="stat-label">Present Days</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${totalDays}</div>
                  <div class="stat-label">Total Days</div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                ${attendanceRate >= 80 ? 
                  '<span class="status present">✅ Excellent Attendance</span>' :
                  attendanceRate >= 60 ?
                  '<span class="status" style="background: #F59E0B; color: white;">⚠️ Needs Improvement</span>' :
                  '<span class="status absent">❌ Poor Attendance</span>'
                }
              </div>
              
              <p><strong>Summary:</strong></p>
              <p>This report shows your attendance for ${period}. You have attended ${presentDays} out of ${totalDays} days, resulting in an attendance rate of ${attendanceRate}%.</p>
              
              ${attendanceRate < 80 ? 
                '<p style="color: #EF4444;"><strong>Note:</strong> Your attendance is below the recommended 80%. Please ensure regular attendance to stay on track with your course.</p>' : 
                '<p style="color: #10B981;"><strong>Great job!</strong> Keep up the excellent attendance record.</p>'
              }
            </div>
            <div class="footer">
              <p>This is an automated report from the School Network Tracker system.</p>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Class summary report
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-number { font-size: 2em; font-weight: bold; color: #3B82F6; }
            .stat-label { color: #666; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Class Attendance Summary</h1>
              <p>Period: ${period}</p>
            </div>
            <div class="content">
              <div class="summary-stats">
                <div class="stat-card">
                  <div class="stat-number">${attendanceData.averageAttendance || '0'}%</div>
                  <div class="stat-label">Average Attendance</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${attendanceData.totalStudents || '0'}</div>
                  <div class="stat-label">Total Students</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${attendanceData.presentToday || '0'}</div>
                  <div class="stat-label">Present Today</div>
                </div>
              </div>
              
              <p><strong>Summary:</strong></p>
              <p>This report provides an overview of class attendance for ${period}. The data includes attendance rates and patterns across all students.</p>
            </div>
            <div class="footer">
              <p>This is an automated report from the School Network Tracker system.</p>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }

  async sendStudentListWithPDF(toEmail, studentListData, pdfBuffer) {
    try {
      const htmlContent = this.generateStudentListEmailHTML(studentListData);
      
      const mailOptions = {
        from: {
          name: 'School Network Tracker',
          address: process.env.SMTP_USER || 'macngala4@gmail.com'
        },
        to: toEmail,
        subject: `Student List Report - ${studentListData.generatedDate}`,
        html: htmlContent,
        attachments: [
          {
            filename: `student-list-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Student list email sent successfully to ${toEmail}`);
    } catch (error) {
      console.error('Error sending student list with PDF:', error);
      throw error;
    }
  }

  generateStudentListEmailHTML(studentListData) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .summary-box {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .stat-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .stat-row:last-child {
              border-bottom: none;
            }
            .stat-label {
              font-weight: bold;
              color: #374151;
            }
            .stat-value {
              color: #059669;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 Student List Report</h1>
            <p>Comprehensive overview of all students</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            <p>Please find attached the detailed student list report for your review.</p>
            
            <div class="summary-box">
              <h3>📊 Summary</h3>
              <div class="stat-row">
                <span class="stat-label">Total Students:</span>
                <span class="stat-value">${studentListData.totalStudents}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Active Students:</span>
                <span class="stat-value">${studentListData.students.filter(s => s.status === 'Active').length}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Generated:</span>
                <span class="stat-value">${studentListData.generatedDate}</span>
              </div>
            </div>
            
            <p>The attached PDF contains detailed information about all students including:</p>
            <ul>
              <li>📝 Student names and contact information</li>
              <li>🎓 Course enrollments</li>
              <li>✅ Current status</li>
              <li>📈 Attendance rates</li>
            </ul>
            
            <p>This report was automatically generated Codegisoft School Network Tracker system.</p>
          </div>
          
          <div class="footer">
            <p>School Network Tracker - Automated Report System</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  }

  // Test email configuration
  async testEmailConfig(emailConfig) {
    try {
      const testTransporter = nodemailer.createTransport({
        host: emailConfig.host || 'smtp.gmail.com',
        port: emailConfig.port || 587,
        secure: emailConfig.secure || false,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await testTransporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // ==================== AUTOMATIC NOTIFICATION METHODS ====================

  // Send shift attendance notification to individual student
  async sendShiftAttendanceNotification(recipientEmail, attendanceData) {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const htmlContent = this.generateShiftNotificationHTML(attendanceData);
      
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'School Network Tracker'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@schooltracker.com'}>`,
        to: recipientEmail,
        subject: `Attendance Update - ${attendanceData.date}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending shift notification:', error);
      throw error;
    }
  }

  // Send weekly attendance summary to student
  async sendWeeklyAttendanceSummary(recipientEmail, weeklyData) {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const htmlContent = this.generateWeeklySummaryHTML(weeklyData);
      
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'School Network Tracker'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@schooltracker.com'}>`,
        to: recipientEmail,
        subject: `Weekly Attendance Summary - ${weeklyData.studentName}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending weekly summary:', error);
      throw error;
    }
  }

  // Send monthly attendance summary to student
  async sendMonthlyAttendanceSummary(recipientEmail, monthlyData) {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const htmlContent = this.generateMonthlySummaryHTML(monthlyData);
      
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'School Network Tracker'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@schooltracker.com'}>`,
        to: recipientEmail,
        subject: `Monthly Attendance Summary - ${monthlyData.studentName}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending monthly summary:', error);
      throw error;
    }
  }

  // ==================== HTML TEMPLATES FOR AUTOMATIC EMAILS ====================

  // Generate HTML for shift attendance notification
  generateShiftNotificationHTML(data) {
    const statusColor = data.isPresent ? '#10B981' : '#EF4444';
    const statusIcon = data.isPresent ? '✅' : '❌';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Attendance Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 20px; }
          .status-card { background: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0; }
          .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; }
          .details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusIcon} Attendance Update</h1>
            <p>Your attendance status for today</p>
          </div>
          <div class="content">
            <h2>Hello ${data.studentName}!</h2>
            <p>Here's your attendance update for today's session.</p>
            
            <div class="status-card">
              <h3>Attendance Status: <span class="status-badge">${data.status}</span></h3>
              <div class="details">
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Time Recorded:</strong> ${data.time}</p>
                <p><strong>Course:</strong> ${data.course}</p>
              </div>
            </div>

            ${data.isPresent ? `
              <div style="background: #10B981; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Great job! 🎉</h4>
                <p>You were marked present for today's session. Keep up the excellent attendance!</p>
              </div>
            ` : `
              <div style="background: #EF4444; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Missed Session ⚠️</h4>
                <p>You were marked absent for today's session. If this is an error, please contact your instructor.</p>
              </div>
            `}

            <p>If you have any questions about your attendance, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from School Network Tracker</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML for weekly summary
  generateWeeklySummaryHTML(data) {
    const attendanceColor = data.attendanceRate >= 80 ? '#10B981' : data.attendanceRate >= 60 ? '#F59E0B' : '#EF4444';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weekly Attendance Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 20px; }
          .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .summary-card { background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: center; }
          .attendance-rate { font-size: 24px; font-weight: bold; color: ${attendanceColor}; }
          .records-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .records-table th, .records-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .records-table th { background: #f8f9fa; }
          .present { color: #10B981; font-weight: bold; }
          .absent { color: #EF4444; font-weight: bold; }
          .footer { text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Attendance Summary</h1>
            <p>${data.weekStartDate} - ${data.weekEndDate}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.studentName}!</h2>
            <p>Here's your attendance summary for the past week in <strong>${data.course}</strong>.</p>
            
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Days Present</h3>
                <div style="font-size: 20px; font-weight: bold; color: #10B981;">${data.presentDays}</div>
              </div>
              <div class="summary-card">
                <h3>Total Days</h3>
                <div style="font-size: 20px; font-weight: bold;">${data.totalDays}</div>
              </div>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <h3>Attendance Rate</h3>
              <div class="attendance-rate">${data.attendanceRate}%</div>
            </div>

            <h3>Daily Records</h3>
            <table class="records-table">
              <thead>
                <tr><th>Date</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                ${data.attendanceRecords.map(record => `
                  <tr>
                    <td>${record.date}</td>
                    <td class="${record.status.toLowerCase()}">${record.status}</td>
                    <td>${record.time}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${data.attendanceRate >= 80 ? `
              <div style="background: #10B981; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Excellent Attendance! 🌟</h4>
                <p>You're maintaining great attendance. Keep it up!</p>
              </div>
            ` : data.attendanceRate >= 60 ? `
              <div style="background: #F59E0B; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Good Progress 📈</h4>
                <p>Your attendance is good, but there's room for improvement. Try to attend more sessions!</p>
              </div>
            ` : `
              <div style="background: #EF4444; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Needs Improvement ⚠️</h4>
                <p>Your attendance rate is below recommended levels. Please make an effort to attend more classes.</p>
              </div>
            `}
          </div>
          <div class="footer">
            <p>Weekly Summary Report - School Network Tracker</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML for monthly summary
  generateMonthlySummaryHTML(data) {
    const attendanceColor = data.attendanceRate >= 80 ? '#10B981' : data.attendanceRate >= 60 ? '#F59E0B' : '#EF4444';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Monthly Attendance Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 20px; }
          .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
          .summary-card { background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: center; }
          .attendance-rate { font-size: 24px; font-weight: bold; color: ${attendanceColor}; }
          .records-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .records-table th, .records-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .records-table th { background: #f8f9fa; }
          .present { color: #10B981; font-weight: bold; }
          .absent { color: #EF4444; font-weight: bold; }
          .footer { text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Monthly Attendance Summary</h1>
            <p>${data.monthStartDate} - ${data.monthEndDate}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.studentName}!</h2>
            <p>Here's your comprehensive attendance summary for the past month in <strong>${data.course}</strong>.</p>
            
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Days Present</h3>
                <div style="font-size: 18px; font-weight: bold; color: #10B981;">${data.presentDays}</div>
              </div>
              <div class="summary-card">
                <h3>Total Days</h3>
                <div style="font-size: 18px; font-weight: bold;">${data.totalDays}</div>
              </div>
              <div class="summary-card">
                <h3>Attendance Rate</h3>
                <div class="attendance-rate" style="font-size: 18px;">${data.attendanceRate}%</div>
              </div>
            </div>

            <h3>Recent Records (Last 10 sessions)</h3>
            <table class="records-table">
              <thead>
                <tr><th>Date</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                ${data.attendanceRecords.map(record => `
                  <tr>
                    <td>${record.date}</td>
                    <td class="${record.status.toLowerCase()}">${record.status}</td>
                    <td>${record.time}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${data.attendanceRate >= 80 ? `
              <div style="background: #10B981; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Outstanding Performance! 🏆</h4>
                <p>Your monthly attendance is excellent. You're a model student!</p>
              </div>
            ` : data.attendanceRate >= 60 ? `
              <div style="background: #F59E0B; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Satisfactory Progress 📊</h4>
                <p>Your attendance is acceptable, but consistent improvement would be beneficial.</p>
              </div>
            ` : `
              <div style="background: #EF4444; color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Attention Required ⚠️</h4>
                <p>Your monthly attendance is concerning. Please schedule a meeting with your instructor to discuss improvement strategies.</p>
              </div>
            `}

            <p><strong>Next month goal:</strong> Aim for at least 80% attendance rate for optimal learning outcomes.</p>
          </div>
          <div class="footer">
            <p>Monthly Summary Report - School Network Tracker</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
