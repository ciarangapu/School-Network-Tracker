import PDFDocument from 'pdfkit';
import fs from 'fs';

class PDFService {
  
  // Generate individual student attendance PDF
  async generateStudentAttendancePDF(attendanceData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30 });
        const chunks = [];

        // Collect PDF data
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        // Compact Header
        this.addCompactHeader(doc, 'Student Attendance Report');
        
        // Student Information - Compact
        doc.moveDown(1);
        doc.fontSize(11).fillColor('#333333');
        doc.text(`Student: ${attendanceData.studentName}  |  Course: ${attendanceData.course}`, { align: 'left' });
        doc.text(`Email: ${attendanceData.email}  |  Period: ${attendanceData.period}`, { align: 'left' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'left' });

        // Compact Attendance Summary
        doc.moveDown(1);
        this.drawCompactSummaryBox(doc, attendanceData);

        // Only show recent records table if space allows
        if (attendanceData.attendanceRecords && attendanceData.attendanceRecords.length > 0) {
          doc.moveDown(1);
          this.drawCompactAttendanceTable(doc, attendanceData.attendanceRecords.slice(0, 8)); // Limit to 8 records
        }

        // Compact Footer
        this.addCompactFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate class summary PDF
  async generateClassSummaryPDF(summaryData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        // Compact Header
        this.addCompactHeader(doc, 'Class Attendance Summary');

        // Summary Information - Compact
        doc.moveDown(1);
        doc.fontSize(11).fillColor('#333333');
        doc.text(`Period: ${summaryData.period}  |  Total Students: ${summaryData.totalStudents}  |  Generated: ${new Date().toLocaleDateString()}`, { align: 'left' });

        // Compact Class Statistics
        doc.moveDown(1);
        this.drawCompactClassStatistics(doc, summaryData);

        // Compact Student List Table
        if (summaryData.students && summaryData.students.length > 0) {
          doc.moveDown(1);
          this.drawCompactStudentSummaryTable(doc, summaryData.students.slice(0, 15)); // Limit to 15 students
        }

        // Compact Footer
        this.addCompactFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper method to add header
  addHeader(doc, title) {
    // Logo/Title area
    doc.rect(50, 50, doc.page.width - 100, 80).fill('#3B82F6');
    
    doc.fontSize(24).fillColor('white');
    doc.text(title, 70, 75, { align: 'left' });
    
    doc.fontSize(12).fillColor('white');
    doc.text('School Network Tracker', doc.page.width - 200, 105, { align: 'right' });
    
    doc.fillColor('#333333'); // Reset color
  }

  // Helper method to draw summary box
  drawSummaryBox(doc, data) {
    const boxY = doc.y;
    const boxHeight = 120;
    const boxWidth = doc.page.width - 100;

    // Background box
    doc.rect(50, boxY, boxWidth, boxHeight).fill('#F8F9FA').stroke('#E5E7EB');

    // Content
    doc.fillColor('#333333');
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Attendance Summary', 70, boxY + 20);

    doc.fontSize(12).font('Helvetica');
    
    // Left column
    doc.text(`Present Days: ${data.presentDays || 0}`, 70, boxY + 45);
    doc.text(`Total Days: ${data.totalDays || 0}`, 70, boxY + 65);
    
    // Right column
    doc.text(`Attendance Rate: ${data.attendanceRate || 0}%`, 300, boxY + 45);
    
    // Status indicator
    const rate = parseFloat(data.attendanceRate || 0);
    const statusColor = rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444';
    const statusText = rate >= 80 ? 'Excellent' : rate >= 60 ? 'Needs Improvement' : 'Poor';
    
    doc.fillColor(statusColor);
    doc.text(`Status: ${statusText}`, 300, boxY + 65);
    
    doc.fillColor('#333333'); // Reset color
    doc.y = boxY + boxHeight + 10;
  }

  // Helper method to draw attendance table
  drawAttendanceTable(doc, records) {
    if (!records || records.length === 0) {
      doc.text('No attendance records available.', { align: 'center' });
      return;
    }

    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Recent Attendance Records', { align: 'left' });
    doc.moveDown(1);

    const startY = doc.y;
    const rowHeight = 25;
    const colWidths = [100, 80, 100, 150];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Table headers
    doc.fontSize(10).font('Helvetica-Bold');
    let currentX = 50;
    
    doc.rect(50, startY, tableWidth, rowHeight).fill('#F3F4F6').stroke('#E5E7EB');
    
    doc.fillColor('#374151');
    doc.text('Date', currentX + 5, startY + 8);
    currentX += colWidths[0];
    doc.text('Status', currentX + 5, startY + 8);
    currentX += colWidths[1];
    doc.text('Time In', currentX + 5, startY + 8);
    currentX += colWidths[2];
    doc.text('Notes', currentX + 5, startY + 8);

    // Table rows
    doc.font('Helvetica').fillColor('#333333');
    
    records.slice(0, 15).forEach((record, index) => { // Limit to 15 recent records
      const rowY = startY + rowHeight * (index + 1);
      
      // Alternate row colors
      if (index % 2 === 1) {
        doc.rect(50, rowY, tableWidth, rowHeight).fill('#F9FAFB').stroke('#E5E7EB');
      } else {
        doc.rect(50, rowY, tableWidth, rowHeight).stroke('#E5E7EB');
      }

      currentX = 50;
      doc.text(record.date || 'N/A', currentX + 5, rowY + 8);
      currentX += colWidths[0];
      
      // Status with color
      const statusColor = record.status === 'Present' ? '#10B981' : 
                         record.status === 'Late' ? '#F59E0B' : '#EF4444';
      doc.fillColor(statusColor);
      doc.text(record.status || 'N/A', currentX + 5, rowY + 8);
      doc.fillColor('#333333');
      currentX += colWidths[1];
      
      doc.text(record.timeIn || 'N/A', currentX + 5, rowY + 8);
      currentX += colWidths[2];
      doc.text(record.notes || '', currentX + 5, rowY + 8);
    });

    doc.y = startY + rowHeight * (Math.min(records.length, 15) + 1) + 10;
  }

  // Helper method to draw statistics
  drawStatistics(doc, data) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Attendance Statistics', { align: 'left' });
    doc.moveDown(1);

    const stats = [
      { label: 'Best Month', value: data.bestMonth || 'N/A' },
      { label: 'Worst Month', value: data.worstMonth || 'N/A' },
      { label: 'Average Daily Attendance', value: `${data.averageDaily || 0}%` },
      { label: 'Days Absent', value: `${(data.totalDays || 0) - (data.presentDays || 0)}` }
    ];

    stats.forEach((stat, index) => {
      const x = 50 + (index % 2) * 250;
      const y = doc.y + Math.floor(index / 2) * 25;
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`${stat.label}:`, x, y);
      doc.font('Helvetica');
      doc.text(stat.value, x + 150, y);
    });

    doc.y += Math.ceil(stats.length / 2) * 25 + 10;
  }

  // Helper method to draw class statistics
  drawClassStatistics(doc, data) {
    const boxY = doc.y;
    const boxHeight = 100;
    const boxWidth = doc.page.width - 100;

    doc.rect(50, boxY, boxWidth, boxHeight).fill('#F8F9FA').stroke('#E5E7EB');

    doc.fillColor('#333333');
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Class Statistics', 70, boxY + 20);

    doc.fontSize(12).font('Helvetica');
    doc.text(`Average Attendance: ${data.averageAttendance || 0}%`, 70, boxY + 45);
    doc.text(`Students Present Today: ${data.presentToday || 0}`, 70, boxY + 65);
    doc.text(`Students Absent Today: ${data.absentToday || 0}`, 300, boxY + 45);
    doc.text(`Total Class Days: ${data.totalClassDays || 0}`, 300, boxY + 65);

    doc.y = boxY + boxHeight + 10;
  }

  // Helper method to draw student summary table
  drawStudentSummaryTable(doc, students) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Student Summary', { align: 'left' });
    doc.moveDown(1);

    const startY = doc.y;
    const rowHeight = 25;
    const colWidths = [150, 100, 80, 80, 90];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Headers
    doc.fontSize(10).font('Helvetica-Bold');
    let currentX = 50;
    
    doc.rect(50, startY, tableWidth, rowHeight).fill('#F3F4F6').stroke('#E5E7EB');
    
    doc.fillColor('#374151');
    doc.text('Student Name', currentX + 5, startY + 8);
    currentX += colWidths[0];
    doc.text('Course', currentX + 5, startY + 8);
    currentX += colWidths[1];
    doc.text('Present', currentX + 5, startY + 8);
    currentX += colWidths[2];
    doc.text('Rate %', currentX + 5, startY + 8);
    currentX += colWidths[3];
    doc.text('Status', currentX + 5, startY + 8);

    // Rows
    doc.font('Helvetica').fillColor('#333333');
    
    students.slice(0, 20).forEach((student, index) => {
      const rowY = startY + rowHeight * (index + 1);
      
      if (index % 2 === 1) {
        doc.rect(50, rowY, tableWidth, rowHeight).fill('#F9FAFB').stroke('#E5E7EB');
      } else {
        doc.rect(50, rowY, tableWidth, rowHeight).stroke('#E5E7EB');
      }

      currentX = 50;
      doc.text(student.name || 'N/A', currentX + 5, rowY + 8);
      currentX += colWidths[0];
      doc.text(student.course || 'N/A', currentX + 5, rowY + 8);
      currentX += colWidths[1];
      doc.text(student.presentDays || '0', currentX + 5, rowY + 8);
      currentX += colWidths[2];
      doc.text(`${student.attendanceRate || 0}%`, currentX + 5, rowY + 8);
      currentX += colWidths[3];
      
      const rate = parseFloat(student.attendanceRate || 0);
      const statusColor = rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444';
      doc.fillColor(statusColor);
      doc.text(rate >= 80 ? 'Good' : rate >= 60 ? 'Fair' : 'Poor', currentX + 5, rowY + 8);
      doc.fillColor('#333333');
    });

    doc.y = startY + rowHeight * (Math.min(students.length, 20) + 1) + 10;
  }

  // Helper method to add footer
  addFooter(doc) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;

    doc.y = footerY;
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Generated by School Network Tracker - ${new Date().toLocaleDateString()}`, 50, footerY, {
      align: 'center',
      width: doc.page.width - 100
    });
    
    doc.text(`Page 1`, doc.page.width - 100, footerY + 20, { align: 'right' });
  }

  // Generate student list PDF - Compact Version
  async generateStudentListPDF(studentListData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        // Compact Header
        this.addCompactHeader(doc, 'Student List Report');

        // Report Information - Compact
        doc.moveDown(1);
        doc.fontSize(11).fillColor('#333333');
        doc.text(`Generated: ${studentListData.generatedDate}  |  Total Students: ${studentListData.totalStudents}`, { align: 'left' });

        // Compact Student List Table
        doc.moveDown(1);
        this.drawCompactStudentListTable(doc, studentListData.students);

        // Compact Footer
        this.addCompactFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper method to draw student summary box for student list
  drawStudentSummaryBox(doc, data) {
    const boxY = doc.y;
    const boxHeight = 100;
    const boxWidth = doc.page.width - 100;

    doc.rect(50, boxY, boxWidth, boxHeight).fill('#F8F9FA').stroke('#E5E7EB');

    doc.fillColor('#333333');
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Summary', 70, boxY + 20);

    doc.fontSize(12).font('Helvetica');
    
    // Count by course
    const courseCounts = {};
    data.students.forEach(student => {
      courseCounts[student.course] = (courseCounts[student.course] || 0) + 1;
    });

    doc.text(`Total Students: ${data.totalStudents}`, 70, boxY + 45);
    doc.text(`Active Students: ${data.students.filter(s => s.status === 'Active').length}`, 300, boxY + 45);
    
    const topCourse = Object.keys(courseCounts).reduce((a, b) => courseCounts[a] > courseCounts[b] ? a : b, '');
    doc.text(`Most Popular Course: ${topCourse}`, 70, boxY + 65);
    doc.text(`Generated: ${data.generatedDate}`, 300, boxY + 65);

    doc.y = boxY + boxHeight + 10;
  }

  // Helper method to draw student list table
  drawStudentListTable(doc, students) {
    if (!students || students.length === 0) {
      doc.text('No students found.', { align: 'center' });
      return;
    }

    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Student Details', { align: 'left' });
    doc.moveDown(1);

    const startY = doc.y;
    const rowHeight = 25;
    const colWidths = [120, 120, 100, 80, 80];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Table headers
    doc.fontSize(10).font('Helvetica-Bold');
    let currentX = 50;
    
    doc.rect(50, startY, tableWidth, rowHeight).fill('#F3F4F6').stroke('#E5E7EB');
    
    doc.fillColor('#374151');
    doc.text('Name', currentX + 5, startY + 8);
    currentX += colWidths[0];
    doc.text('Email', currentX + 5, startY + 8);
    currentX += colWidths[1];
    doc.text('Course', currentX + 5, startY + 8);
    currentX += colWidths[2];
    doc.text('Status', currentX + 5, startY + 8);
    currentX += colWidths[3];
    doc.text('Attendance', currentX + 5, startY + 8);

    // Table rows
    doc.font('Helvetica').fillColor('#333333');
    
    students.forEach((student, index) => {
      const rowY = startY + rowHeight * (index + 1);
      
      if (index % 2 === 1) {
        doc.rect(50, rowY, tableWidth, rowHeight).fill('#F9FAFB').stroke('#E5E7EB');
      } else {
        doc.rect(50, rowY, tableWidth, rowHeight).stroke('#E5E7EB');
      }

      currentX = 50;
      doc.text(student.name || 'N/A', currentX + 5, rowY + 8);
      currentX += colWidths[0];
      doc.text(student.email || 'N/A', currentX + 5, rowY + 8);
      currentX += colWidths[1];
      doc.text(student.course || 'N/A', currentX + 5, rowY + 8);
      currentX += colWidths[2];
      
      // Status with color
      const statusColor = student.status === 'Active' ? '#10B981' : '#EF4444';
      doc.fillColor(statusColor);
      doc.text(student.status || 'N/A', currentX + 5, rowY + 8);
      doc.fillColor('#333333');
      currentX += colWidths[3];
      
      doc.text(`${student.attendanceRate || 0}%`, currentX + 5, rowY + 8);

      // Start new page if needed
      if (rowY > doc.page.height - 100) {
        doc.addPage();
        doc.y = 50;
        return; // Skip remaining students on this page
      }
    });

    doc.y = startY + rowHeight * (students.length + 1) + 10;
  }

  // ==================== COMPACT METHODS FOR SINGLE PAGE ====================

  // Compact header
  addCompactHeader(doc, title) {
    doc.rect(30, 30, doc.page.width - 60, 50).fill('#3B82F6');
    doc.fontSize(18).fillColor('white');
    doc.text(title, 40, 45, { align: 'left' });
    doc.fontSize(10).fillColor('white');
    doc.text('School Network Tracker', doc.page.width - 150, 60, { align: 'right' });
    doc.fillColor('#333333');
    doc.y = 90;
  }

  // Compact summary box
  drawCompactSummaryBox(doc, data) {
    const boxY = doc.y;
    const boxHeight = 60;
    const boxWidth = doc.page.width - 60;

    doc.rect(30, boxY, boxWidth, boxHeight).fill('#F8F9FA').stroke('#E5E7EB');

    doc.fillColor('#333333');
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Summary', 40, boxY + 10);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Present: ${data.presentDays || 0}/${data.totalDays || 0} days`, 40, boxY + 25);
    doc.text(`Attendance Rate: ${data.attendanceRate || 0}%`, 40, boxY + 40);
    
    // Status indicator
    const rate = parseFloat(data.attendanceRate || 0);
    const statusColor = rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444';
    const statusText = rate >= 80 ? 'Excellent' : rate >= 60 ? 'Good' : 'Poor';
    
    doc.fillColor(statusColor);
    doc.text(`Status: ${statusText}`, 250, boxY + 25);
    
    doc.fillColor('#333333');
    doc.y = boxY + boxHeight + 10;
  }

  // Compact attendance table
  drawCompactAttendanceTable(doc, records) {
    if (!records || records.length === 0) return;

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Recent Records', { align: 'left' });
    doc.moveDown(0.5);

    const startY = doc.y;
    const rowHeight = 15;
    const colWidths = [80, 60, 70, 120];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Headers
    doc.fontSize(9).font('Helvetica-Bold');
    let currentX = 30;
    
    doc.rect(30, startY, tableWidth, rowHeight).fill('#F3F4F6').stroke('#E5E7EB');
    doc.fillColor('#374151');
    doc.text('Date', currentX + 3, startY + 5);
    currentX += colWidths[0];
    doc.text('Status', currentX + 3, startY + 5);
    currentX += colWidths[1];
    doc.text('Time', currentX + 3, startY + 5);
    currentX += colWidths[2];
    doc.text('Notes', currentX + 3, startY + 5);

    // Rows
    doc.font('Helvetica').fillColor('#333333');
    
    records.forEach((record, index) => {
      const rowY = startY + rowHeight * (index + 1);
      
      if (index % 2 === 1) {
        doc.rect(30, rowY, tableWidth, rowHeight).fill('#F9FAFB').stroke('#E5E7EB');
      } else {
        doc.rect(30, rowY, tableWidth, rowHeight).stroke('#E5E7EB');
      }

      currentX = 30;
      doc.text(record.date || 'N/A', currentX + 3, rowY + 3);
      currentX += colWidths[0];
      
      const statusColor = record.status === 'Present' ? '#10B981' : '#EF4444';
      doc.fillColor(statusColor);
      doc.text(record.status || 'N/A', currentX + 3, rowY + 3);
      doc.fillColor('#333333');
      currentX += colWidths[1];
      
      doc.text(record.timeIn || 'N/A', currentX + 3, rowY + 3);
      currentX += colWidths[2];
      doc.text((record.notes || '').substring(0, 15), currentX + 3, rowY + 3);
    });

    doc.y = startY + rowHeight * (records.length + 1) + 10;
  }

  // Compact class statistics
  drawCompactClassStatistics(doc, data) {
    const boxY = doc.y;
    const boxHeight = 60;
    const boxWidth = doc.page.width - 60;

    doc.rect(30, boxY, boxWidth, boxHeight).fill('#F8F9FA').stroke('#E5E7EB');

    doc.fillColor('#333333');
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Class Overview', 40, boxY + 10);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Average Attendance: ${data.averageAttendance || 0}%`, 40, boxY + 25);
    doc.text(`Present Today: ${data.presentToday || 0}`, 40, boxY + 40);
    doc.text(`Absent Today: ${data.absentToday || 0}`, 200, boxY + 25);
    doc.text(`Total Days: ${data.totalClassDays || 0}`, 200, boxY + 40);

    doc.y = boxY + boxHeight + 10;
  }

  // Compact student summary table
  drawCompactStudentSummaryTable(doc, students) {
    if (!students || students.length === 0) return;

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Student Summary', { align: 'left' });
    doc.moveDown(0.5);

    const startY = doc.y;
    const rowHeight = 15;
    const colWidths = [120, 80, 50, 50];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Headers
    doc.fontSize(9).font('Helvetica-Bold');
    let currentX = 30;
    
    doc.rect(30, startY, tableWidth, rowHeight).fill('#F3F4F6').stroke('#E5E7EB');
    doc.fillColor('#374151');
    doc.text('Name', currentX + 3, startY + 5);
    currentX += colWidths[0];
    doc.text('Course', currentX + 3, startY + 5);
    currentX += colWidths[1];
    doc.text('Present', currentX + 3, startY + 5);
    currentX += colWidths[2];
    doc.text('Rate %', currentX + 3, startY + 5);

    // Rows
    doc.font('Helvetica').fillColor('#333333');
    
    students.forEach((student, index) => {
      const rowY = startY + rowHeight * (index + 1);
      
      if (index % 2 === 1) {
        doc.rect(30, rowY, tableWidth, rowHeight).fill('#F9FAFB').stroke('#E5E7EB');
      } else {
        doc.rect(30, rowY, tableWidth, rowHeight).stroke('#E5E7EB');
      }

      currentX = 30;
      doc.text((student.name || 'N/A').substring(0, 18), currentX + 3, rowY + 3);
      currentX += colWidths[0];
      doc.text((student.course || 'N/A').substring(0, 12), currentX + 3, rowY + 3);
      currentX += colWidths[1];
      doc.text(`${student.presentDays || 0}`, currentX + 3, rowY + 3);
      currentX += colWidths[2];
      
      const rate = student.attendanceRate || 0;
      const rateColor = rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444';
      doc.fillColor(rateColor);
      doc.text(`${rate}%`, currentX + 3, rowY + 3);
      doc.fillColor('#333333');
    });

    doc.y = startY + rowHeight * (students.length + 1) + 10;
  }

  // Compact footer
  addCompactFooter(doc) {
    const footerY = doc.page.height - 50;
    doc.fontSize(8).fillColor('#666666');
    doc.text(`Generated on ${new Date().toLocaleString()} | School Network Tracker`, 30, footerY, { align: 'center' });
  }

  // Compact student list table
  drawCompactStudentListTable(doc, students) {
    if (!students || students.length === 0) {
      doc.text('No students found.', { align: 'center' });
      return;
    }

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Student Details', { align: 'left' });
    doc.moveDown(0.5);

    const startY = doc.y;
    const rowHeight = 15;
    const colWidths = [100, 90, 70, 50, 50];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Headers
    doc.fontSize(9).font('Helvetica-Bold');
    let currentX = 30;
    
    doc.rect(30, startY, tableWidth, rowHeight).fill('#F3F4F6').stroke('#E5E7EB');
    doc.fillColor('#374151');
    doc.text('Name', currentX + 3, startY + 5);
    currentX += colWidths[0];
    doc.text('Email', currentX + 3, startY + 5);
    currentX += colWidths[1];
    doc.text('Course', currentX + 3, startY + 5);
    currentX += colWidths[2];
    doc.text('Status', currentX + 3, startY + 5);
    currentX += colWidths[3];
    doc.text('Rate %', currentX + 3, startY + 5);

    // Rows - Limit to fit on one page
    doc.font('Helvetica').fillColor('#333333');
    const maxStudents = Math.min(students.length, 30); // Limit to 30 students for single page
    
    for (let index = 0; index < maxStudents; index++) {
      const student = students[index];
      const rowY = startY + rowHeight * (index + 1);
      
      if (index % 2 === 1) {
        doc.rect(30, rowY, tableWidth, rowHeight).fill('#F9FAFB').stroke('#E5E7EB');
      } else {
        doc.rect(30, rowY, tableWidth, rowHeight).stroke('#E5E7EB');
      }

      currentX = 30;
      doc.text((student.name || 'N/A').substring(0, 15), currentX + 3, rowY + 3);
      currentX += colWidths[0];
      doc.text((student.email || 'N/A').substring(0, 13), currentX + 3, rowY + 3);
      currentX += colWidths[1];
      doc.text((student.course || 'N/A').substring(0, 10), currentX + 3, rowY + 3);
      currentX += colWidths[2];
      
      // Status with color
      const statusColor = student.status === 'Active' ? '#10B981' : '#EF4444';
      doc.fillColor(statusColor);
      doc.text(student.status || 'N/A', currentX + 3, rowY + 3);
      doc.fillColor('#333333');
      currentX += colWidths[3];
      
      const rate = student.attendanceRate || 0;
      const rateColor = rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444';
      doc.fillColor(rateColor);
      doc.text(`${rate}%`, currentX + 3, rowY + 3);
      doc.fillColor('#333333');
    }

    // If there are more students, add a note
    if (students.length > maxStudents) {
      doc.moveDown(1);
      doc.fontSize(9).fillColor('#666666');
      doc.text(`Note: Showing first ${maxStudents} of ${students.length} students. Use filters for specific students.`, { align: 'center' });
    }

    doc.y = startY + rowHeight * (maxStudents + 1) + 20;
  }
}

export default new PDFService();
