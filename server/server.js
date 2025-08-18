import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import emailService from './services/emailService.js';
import pdfService from './services/pdfService.js';

// Try to import scraper, but don't fail if dependencies are not available
let MacScraper;
try {
  const scraperModule = await import('../scraper/scraper.js');
  MacScraper = scraperModule.default;
  console.log('✅ Scraper module loaded successfully');
} catch (error) {
  console.log('⚠️ Scraper not available, using mock data');
  MacScraper = null;
}

// Try to import database config, but don't fail if MongoDB is not available
let connectDB, seedAdmin, Student, AttendanceSnapshot, Admin, Settings;
let useDatabase = false;

try {
  const dbModule = await import('./config/database.js');
  connectDB = dbModule.default;
  
  const seedModule = await import('./utils/seedAdmin.js');
  seedAdmin = seedModule.default;
  
  // Models
  const studentModule = await import('./models/Student.js');
  Student = studentModule.default;
  
  const attendanceModule = await import('./models/AttendanceSnapshot.js');
  AttendanceSnapshot = attendanceModule.default;
  
  const adminModule = await import('./models/Admin.js');
  Admin = adminModule.default;
  
  const settingsModule = await import('./models/Settings.js');
  Settings = settingsModule.default;
  
  useDatabase = true;
  console.log('✅ Database modules loaded successfully');
} catch (error) {
  console.log('⚠️ Database not available, using in-memory storage');
  useDatabase = false;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve src files for frontend assets
app.use('/src', express.static(path.join(__dirname, '../src')));

// In-memory storage fallback
let inMemoryStudents = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    macAddress: '00:11:22:33:44:55',
    course: 'Full Stack Development',
    joinDate: '2024-01-15',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    macAddress: '00:11:22:33:44:56',
    course: 'IT Networking',
    joinDate: '2024-01-10',
    status: 'Active'
  }
];

let inMemorySnapshots = [];
let inMemorySettings = {
  snapshotInterval: 15,
  attendanceThreshold: 60,
  lateThreshold: 15,
  autoSnapshot: true,
  workingHours: {
    start: '09:00',
    end: '18:00'
  }
};

// Connect to MongoDB if available
if (useDatabase) {
  connectDB();
} else {
  console.log('📊 Using in-memory storage for development');
}

// Initialize scraper (lazy initialization)
let scraper = null;
const getScraper = () => {
  if (!MacScraper) {
    return null; // Return null if scraper module not available
  }
  if (!scraper) {
    scraper = new MacScraper();
  }
  return scraper;
};
let currentSettings = null;

// Load settings on startup
const loadSettings = async () => {
  try {
    if (useDatabase) {
      currentSettings = await Settings.findOne() || new Settings();
      if (!currentSettings._id) {
        await currentSettings.save();
      }
      console.log('⚙️ Settings loaded from database');
    } else {
      currentSettings = inMemorySettings;
      console.log('⚙️ Settings loaded from memory');
    }
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    currentSettings = useDatabase ? new Settings() : inMemorySettings;
  }
};

// Helper function to calculate real attendance rate for a student
const calculateStudentAttendanceRate = async (studentId) => {
  try {
    if (useDatabase) {
      const snapshots = await AttendanceSnapshot.find({});
      const presentCount = snapshots.filter(s => 
        s.presentStudents.some(p => p.studentId.toString() === studentId.toString())
      ).length;
      const totalSnapshots = snapshots.length;
      return totalSnapshots > 0 ? Math.round((presentCount / totalSnapshots) * 100) : 0;
    } else {
      const presentCount = inMemorySnapshots.filter(s => 
        s.presentStudents.some(p => p.studentId === studentId)
      ).length;
      const totalSnapshots = inMemorySnapshots.length;
      return totalSnapshots > 0 ? Math.round((presentCount / totalSnapshots) * 100) : 0;
    }
  } catch (error) {
    console.error('Error calculating attendance rate:', error);
    return 0;
  }
};

// Process scraped MAC addresses
const processScrapedMACs = async (scrapedData) => {
  try {
    console.log(`📊 Processing ${scrapedData.count} MAC addresses at ${scrapedData.timestamp}`);
    
    // Log the actual MAC addresses being processed
    if (scrapedData.macAddresses.length > 0) {
      console.log('🔍 MAC addresses being processed:');
      scrapedData.macAddresses.forEach((mac, index) => {
        console.log(`   ${index + 1}. ${mac}`);
      });
    } else {
      console.log('⚠️ No MAC addresses to process');
    }
    
    if (useDatabase) {
      // Database mode - get all active students
      const students = await Student.find({ status: 'Active' });
      
      console.log(`👥 Checking attendance for ${students.length} active students:`);
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.macAddress})`);
      });
      
      // Create attendance snapshot
      const snapshot = new AttendanceSnapshot({
        timestamp: new Date(scrapedData.timestamp),
        scrapedMACs: scrapedData.macAddresses,
        totalScraped: scrapedData.count,
        presentStudents: [],
        absentStudents: []
      });

      // Check which students are present
      for (const student of students) {
        const isPresent = scrapedData.macAddresses.some(mac => 
          mac.toLowerCase().replace(/[:-]/g, '') === 
          student.macAddress.toLowerCase().replace(/[:-]/g, '')
        );

        console.log(`🔍 Checking ${student.name}: ${student.macAddress} -> ${isPresent ? '✅ PRESENT' : '❌ ABSENT'}`);

        const studentData = {
          studentId: student._id,
          name: student.name,
          macAddress: student.macAddress,
          course: student.course,
          email: student.email
        };

        if (isPresent) {
          snapshot.presentStudents.push(studentData);
        } else {
          snapshot.absentStudents.push(studentData);
        }
      }

      snapshot.totalPresent = snapshot.presentStudents.length;
      snapshot.totalAbsent = snapshot.absentStudents.length;

      await snapshot.save();
      
      console.log(`✅ Snapshot saved: ${snapshot.totalPresent} present, ${snapshot.totalAbsent} absent`);
      return snapshot;
    } else {
      // In-memory mode - process attendance without database
      const activeStudents = inMemoryStudents.filter(s => s.status === 'Active');
      
      const snapshot = {
        timestamp: new Date(scrapedData.timestamp),
        scrapedMACs: scrapedData.macAddresses,
        totalScraped: scrapedData.count,
        presentStudents: [],
        absentStudents: []
      };

      // Check which students are present
      for (const student of activeStudents) {
        const isPresent = scrapedData.macAddresses.some(mac => 
          mac.toLowerCase().replace(/[:-]/g, '') === 
          student.macAddress.toLowerCase().replace(/[:-]/g, '')
        );

        const studentData = {
          studentId: student.id,
          name: student.name,
          macAddress: student.macAddress,
          course: student.course,
          email: student.email
        };

        if (isPresent) {
          snapshot.presentStudents.push(studentData);
        } else {
          snapshot.absentStudents.push(studentData);
        }
      }

      snapshot.totalPresent = snapshot.presentStudents.length;
      snapshot.totalAbsent = snapshot.absentStudents.length;

      // Store in memory (for demo purposes)
      inMemorySnapshots.push(snapshot);
      
      console.log(`✅ Snapshot processed: ${snapshot.totalPresent} present, ${snapshot.totalAbsent} absent`);
      return snapshot;
    }
  } catch (error) {
    console.error('❌ Error processing scraped MACs:', error);
    throw error;
  }
};

// API Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, macAddress, userType } = req.body;
    
    console.log('🔐 Login attempt:', { email, userType, hasPassword: !!password, hasMacAddress: !!macAddress });

    if (userType === 'admin') {
      if (useDatabase) {
        // Database authentication
        const admin = await Admin.findOne({ email });
        if (!admin) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        res.json({
          success: true,
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin'
          }
        });
      } else {
        // In-memory authentication
        if (email === 'admin@example.com' && password === 'admin123') {
          res.json({
            success: true,
            user: {
              id: 'admin',
              name: 'Admin User',
              email: email,
              role: 'admin'
            }
          });
        } else {
          res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      }
    } else {
      // Student login with MAC address
      if (useDatabase) {
        // Normalize the input MAC address by removing all separators
        const normalizedInputMac = macAddress.replace(/[:-]/g, '').toLowerCase();
        
        // Find student by comparing normalized MAC addresses
        const students = await Student.find({ status: 'Active' });
        const student = students.find(s => {
          const normalizedStoredMac = s.macAddress.replace(/[:-]/g, '').toLowerCase();
          return normalizedStoredMac === normalizedInputMac;
        });

        if (!student) {
          return res.status(401).json({ success: false, message: 'MAC address not found or inactive' });
        }

        res.json({
          success: true,
          user: {
            id: student._id,
            name: student.name,
            email: student.email,
            macAddress: student.macAddress,
            course: student.course,
            role: 'student'
          }
        });
      } else {
        // In-memory student authentication
        const student = inMemoryStudents.find(s => 
          s.macAddress.toLowerCase().replace(/[:-]/g, '') === 
          macAddress.toLowerCase().replace(/[:-]/g, '') &&
          s.status === 'Active'
        );

        if (student) {
          res.json({
            success: true,
            user: {
              id: student.id,
              name: student.name,
              email: student.email,
              macAddress: student.macAddress,
              course: student.course,
              role: 'student'
            }
          });
        } else {
          res.status(401).json({ success: false, message: 'MAC address not found' });
        }
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Student registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, macAddress, course } = req.body;

    if (useDatabase) {
      // Database mode - check if email or MAC address already exists
      const existingStudent = await Student.findOne({
        $or: [
          { email: email.toLowerCase() },
          { macAddress: { $regex: new RegExp(macAddress.replace(/[:-]/g, ''), 'i') } }
        ]
      });

      if (existingStudent) {
        const field = existingStudent.email === email.toLowerCase() ? 'Email' : 'MAC address';
        return res.status(400).json({ 
          success: false, 
          message: `${field} already registered` 
        });
      }

      const student = new Student({
        name,
        email: email.toLowerCase(),
        macAddress: macAddress.toUpperCase(),
        course
      });

      await student.save();
      
      res.json({ 
        success: true, 
        message: 'Registration successful',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          course: student.course
        }
      });
    } else {
      // In-memory mode
      const existingStudent = inMemoryStudents.find(s => 
        s.email.toLowerCase() === email.toLowerCase() ||
        s.macAddress.toLowerCase().replace(/[:-]/g, '') === 
        macAddress.toLowerCase().replace(/[:-]/g, '')
      );

      if (existingStudent) {
        const field = existingStudent.email === email.toLowerCase() ? 'Email' : 'MAC address';
        return res.status(400).json({ 
          success: false, 
          message: `${field} already registered` 
        });
      }

      const student = {
        id: `student_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        macAddress: macAddress.toUpperCase(),
        course,
        status: 'Active',
        createdAt: new Date()
      };

      inMemoryStudents.push(student);

      res.json({ 
        success: true, 
        message: 'Registration successful',
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          course: student.course
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Email or MAC address already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// Get students (admin only)
app.get('/api/students', async (req, res) => {
  try {
    if (useDatabase) {
      const students = await Student.find().sort({ createdAt: -1 });
      
      // Calculate real attendance rates for each student
      const studentsWithAttendance = await Promise.all(
        students.map(async (student) => {
          try {
            // Get all snapshots for this student
            const snapshots = await AttendanceSnapshot.find({});
            
            // Count how many times this student was present
            const presentCount = snapshots.filter(s => 
              s.presentStudents.some(p => p.studentId.toString() === student._id.toString())
            ).length;
            
            // Total snapshots taken
            const totalSnapshots = snapshots.length;
            
            // Calculate attendance rate
            const attendanceRate = totalSnapshots > 0 ? 
              Math.round((presentCount / totalSnapshots) * 100) : 0;
            
            return {
              ...student.toObject(),
              attendanceRate,
              presentCount,
              totalSnapshots
            };
          } catch (error) {
            console.error(`Error calculating attendance for ${student.name}:`, error);
            return {
              ...student.toObject(),
              attendanceRate: 0,
              presentCount: 0,
              totalSnapshots: 0
            };
          }
        })
      );
      
      res.json(studentsWithAttendance);
    } else {
      // Return in-memory students sorted by creation date
      const sortedStudents = inMemoryStudents.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // For in-memory mode, add fake attendance calculation based on snapshots
      const studentsWithAttendance = sortedStudents.map(student => {
        const presentCount = inMemorySnapshots.filter(s => 
          s.presentStudents.some(p => p.studentId === student.id)
        ).length;
        
        const totalSnapshots = inMemorySnapshots.length;
        const attendanceRate = totalSnapshots > 0 ? 
          Math.round((presentCount / totalSnapshots) * 100) : 0;
        
        return {
          ...student,
          attendanceRate,
          presentCount,
          totalSnapshots
        };
      });
      
      res.json(studentsWithAttendance);
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update student MAC address
app.put('/api/students/:id/mac', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentMac, newMac } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Verify current MAC address
    if (student.macAddress.toLowerCase().replace(/[:-]/g, '') !== 
        currentMac.toLowerCase().replace(/[:-]/g, '')) {
      return res.status(400).json({ success: false, message: 'Current MAC address does not match' });
    }

    // Check if new MAC is already in use
    const existingStudent = await Student.findOne({
      _id: { $ne: id },
      macAddress: { $regex: new RegExp(newMac.replace(/[:-]/g, ''), 'i') }
    });

    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'New MAC address already in use' });
    }

    student.macAddress = newMac.toUpperCase();
    student.lastMacUpdate = new Date();
    await student.save();

    res.json({ success: true, student });
  } catch (error) {
    console.error('Error updating MAC address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance snapshots
app.get('/api/attendance/snapshots', async (req, res) => {
  try {
    const { startDate, endDate, studentId, limit = 100 } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    let snapshots = await AttendanceSnapshot.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    if (studentId) {
      // Filter for specific student
      snapshots = snapshots.map(snapshot => ({
        ...snapshot.toObject(),
        isPresent: snapshot.presentStudents.some(s => s.studentId.toString() === studentId),
        studentData: snapshot.presentStudents.find(s => s.studentId.toString() === studentId) || 
                     snapshot.absentStudents.find(s => s.studentId.toString() === studentId)
      }));
    }

    res.json(snapshots);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance summary
app.get('/api/attendance/summary', async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    
    let query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (studentId) {
      // Summary for specific student
      const snapshots = await AttendanceSnapshot.find(query);
      
      const presentCount = snapshots.filter(s => 
        s.presentStudents.some(p => p.studentId.toString() === studentId)
      ).length;
      
      const totalSnapshots = snapshots.length;
      const attendanceRate = totalSnapshots > 0 ? (presentCount / totalSnapshots * 100) : 0;

      res.json({
        studentId,
        totalSnapshots,
        presentCount,
        absentCount: totalSnapshots - presentCount,
        attendanceRate: parseFloat(attendanceRate.toFixed(1))
      });
    } else {
      // Overall summary
      const totalStudents = await Student.countDocuments({ status: 'Active' });
      const totalSnapshots = await AttendanceSnapshot.countDocuments(query);
      const latestSnapshot = await AttendanceSnapshot.findOne(query).sort({ timestamp: -1 });
      
      res.json({
        totalStudents,
        totalSnapshots,
        currentPresent: latestSnapshot ? latestSnapshot.totalPresent : 0,
        currentAbsent: latestSnapshot ? latestSnapshot.totalAbsent : 0,
        lastUpdate: latestSnapshot ? latestSnapshot.timestamp : null
      });
    }
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get/Update attendance settings
app.get('/api/settings', async (req, res) => {
  try {
    if (useDatabase) {
      const settings = await Settings.findOne() || new Settings();
      res.json(settings);
    } else {
      res.json(inMemorySettings);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    if (useDatabase) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
      }

      Object.assign(settings, req.body);
      await settings.save();
      
      currentSettings = settings;
    } else {
      Object.assign(inMemorySettings, req.body);
      currentSettings = inMemorySettings;
    }

    // Restart scraping with new interval if auto-snapshot is enabled
    if (currentSettings.autoSnapshot) {
      const scraperInstance = getScraper();
      scraperInstance.stopPeriodicScraping();
      await scraperInstance.startPeriodicScraping(currentSettings.snapshotInterval, processScrapedMACs);
      console.log(`🔄 Scraping restarted with ${currentSettings.snapshotInterval} minute interval`);
    }

    res.json(currentSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Manual snapshot trigger
app.post('/api/attendance/snapshot', async (req, res) => {
  try {
    console.log('\n🎯 Manual snapshot triggered via API');
    const scraperInstance = getScraper();
    if (!scraperInstance) {
      return res.status(503).json({ success: false, error: 'Scraper not available' });
    }
    const scrapedData = await scraperInstance.scrapeMACs();
    const snapshot = await processScrapedMACs(scrapedData);
    res.json({ success: true, snapshot });
  } catch (error) {
    console.error('Error taking snapshot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test scraper endpoint (just scraping, no processing)
app.get('/api/scraper/test', async (req, res) => {
  try {
    console.log('\n🧪 Test scraper endpoint called');
    const scraperInstance = getScraper();
    if (!scraperInstance) {
      return res.status(503).json({ success: false, error: 'Scraper not available' });
    }
    const scrapedData = await scraperInstance.scrapeMACs();
    console.log('\n✅ Test scraping completed successfully');
    res.json({ success: true, data: scrapedData });
  } catch (error) {
    console.error('❌ Test scraping failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current connected MACs (for live view)
app.get('/api/scraper/current', async (req, res) => {
  try {
    const scraperInstance = getScraper();
    if (!scraperInstance) {
      return res.status(503).json({ success: false, error: 'Scraper not available' });
    }
    const scrapedData = await scraperInstance.scrapeMACs();
    res.json(scrapedData);
  } catch (error) {
    console.error('Error fetching current MACs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scraper status
app.get('/api/scraper/status', async (req, res) => {
  try {
    const scraperInstance = getScraper();
    const status = scraperInstance.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error fetching scraper status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset scraper circuit breaker
app.post('/api/scraper/reset', async (req, res) => {
  try {
    const scraperInstance = getScraper();
    scraperInstance.resetCircuitBreaker();
    res.json({ success: true, message: 'Circuit breaker reset successfully' });
  } catch (error) {
    console.error('Error resetting circuit breaker:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get devices with student information
app.get('/api/scraper/devices', async (req, res) => {
  try {
    const scraperInstance = getScraper();
    if (!scraperInstance || !scraperInstance.isConnected()) {
      return res.status(503).json({ success: false, message: 'Scraper not connected' });
    }

    const devices = await scraperInstance.getDevices();
    
    // Match devices with students
    const devicesWithStudents = [];
    
    for (const device of devices) {
      let student = null;
      
      if (useDatabase) {
        // Database mode
        student = await Student.findOne({ 
          macAddress: { $regex: new RegExp(device.macAddress.replace(/[:-]/g, ''), 'i') },
          status: 'Active'
        });
      } else {
        // In-memory mode
        student = inMemoryStudents.find(s => 
          s.macAddress.toLowerCase().replace(/[:-]/g, '') === 
          device.macAddress.toLowerCase().replace(/[:-]/g, '') &&
          s.status === 'Active'
        );
      }

      devicesWithStudents.push({
        ...device,
        student: student ? {
          id: student._id || student.id,
          name: student.name,
          email: student.email,
          course: student.course
        } : null
      });
    }

    res.json({ success: true, devices: devicesWithStudents });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch devices' });
  }
});

// Email and PDF Export Endpoints

// Send attendance report via email
app.post('/api/attendance/email', async (req, res) => {
  try {
    const { recipientEmail, studentId, reportType, period } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    let attendanceData;

    if (reportType === 'individual' && studentId) {
      // Get individual student data
      if (useDatabase) {
        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get attendance snapshots for the student
        const snapshots = await AttendanceSnapshot.find({
          $or: [
            { 'presentStudents.studentId': studentId },
            { 'absentStudents.studentId': studentId }
          ]
        }).sort({ timestamp: -1 }).limit(30);

        const presentDays = snapshots.filter(s => 
          s.presentStudents.some(p => p.studentId.toString() === studentId)
        ).length;

        const totalDays = snapshots.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        attendanceData = {
          studentName: student.name,
          email: student.email,
          course: student.course,
          presentDays,
          totalDays,
          attendanceRate,
          period: period || 'Last 30 days',
          attendanceRecords: snapshots.map(s => ({
            date: s.timestamp.toLocaleDateString(),
            status: s.presentStudents.some(p => p.studentId.toString() === studentId) ? 'Present' : 'Absent',
            timeIn: s.timestamp.toLocaleTimeString(),
            notes: ''
          }))
        };
      } else {
        // In-memory mode
        const student = inMemoryStudents.find(s => s.id === studentId);
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
        }

        attendanceData = {
          studentName: student.name,
          email: student.email,
          course: student.course,
          presentDays: 15,
          totalDays: 20,
          attendanceRate: 75,
          period: period || 'Last 30 days',
          attendanceRecords: []
        };
      }
    } else {
      // Class summary
      if (useDatabase) {
        const students = await Student.find({ status: 'Active' });
        const recentSnapshots = await AttendanceSnapshot.find()
          .sort({ timestamp: -1 })
          .limit(30);

        // Calculate real attendance data for each student
        const studentsWithAttendance = await Promise.all(
          students.map(async (s) => {
            const attendanceRate = await calculateStudentAttendanceRate(s._id);
            const presentDays = Math.round((attendanceRate / 100) * recentSnapshots.length);
            return {
              name: s.name,
              course: s.course,
              attendanceRate,
              presentDays
            };
          })
        );

        // Calculate average attendance
        const averageAttendance = studentsWithAttendance.length > 0 ? 
          Math.round(studentsWithAttendance.reduce((sum, s) => sum + s.attendanceRate, 0) / studentsWithAttendance.length) : 0;

        attendanceData = {
          period: period || 'Last 30 days',
          totalStudents: students.length,
          averageAttendance,
          presentToday: recentSnapshots[0]?.totalPresent || 0,
          absentToday: recentSnapshots[0]?.totalAbsent || 0,
          totalClassDays: recentSnapshots.length,
          students: studentsWithAttendance
        };
      } else {
        // In-memory mode with real calculations
        const activeStudents = inMemoryStudents.filter(s => s.status === 'Active');
        const studentsWithAttendance = activeStudents.map(s => {
          const attendanceRate = calculateStudentAttendanceRate(s.id);
          const presentDays = Math.round((attendanceRate / 100) * inMemorySnapshots.length);
          return {
            name: s.name,
            course: s.course,
            attendanceRate,
            presentDays
          };
        });

        const averageAttendance = studentsWithAttendance.length > 0 ? 
          Math.round(studentsWithAttendance.reduce((sum, s) => sum + s.attendanceRate, 0) / studentsWithAttendance.length) : 0;

        attendanceData = {
          period: period || 'Last 30 days',
          totalStudents: inMemoryStudents.length,
          averageAttendance,
          presentToday: inMemorySnapshots[inMemorySnapshots.length - 1]?.totalPresent || 0,
          absentToday: inMemorySnapshots[inMemorySnapshots.length - 1]?.totalAbsent || 0,
          totalClassDays: inMemorySnapshots.length,
          students: studentsWithAttendance
        };
      }
    }

    // Initialize email service if not already done
    if (currentSettings && currentSettings.emailConfig) {
      await emailService.initialize(currentSettings.emailConfig);
    }

    const result = await emailService.sendAttendanceReport(recipientEmail, attendanceData, reportType);
    res.json({ success: true, message: 'Email sent successfully', messageId: result.messageId });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// Generate and download PDF report
app.post('/api/attendance/pdf', async (req, res) => {
  try {
    const { studentId, reportType, period } = req.body;

    let attendanceData;

    if (reportType === 'individual' && studentId) {
      // Get individual student data
      if (useDatabase) {
        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get attendance snapshots for the student
        const snapshots = await AttendanceSnapshot.find({
          $or: [
            { 'presentStudents.studentId': studentId },
            { 'absentStudents.studentId': studentId }
          ]
        }).sort({ timestamp: -1 }).limit(30);

        const presentDays = snapshots.filter(s => 
          s.presentStudents.some(p => p.studentId.toString() === studentId)
        ).length;

        const totalDays = snapshots.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        attendanceData = {
          studentName: student.name,
          email: student.email,
          course: student.course,
          presentDays,
          totalDays,
          attendanceRate,
          period: period || 'Last 30 days',
          attendanceRecords: snapshots.map(s => ({
            date: s.timestamp.toLocaleDateString(),
            status: s.presentStudents.some(p => p.studentId.toString() === studentId) ? 'Present' : 'Absent',
            timeIn: s.timestamp.toLocaleTimeString(),
            notes: ''
          }))
        };
      } else {
        // In-memory mode
        const student = inMemoryStudents.find(s => s.id === studentId);
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
        }

        attendanceData = {
          studentName: student.name,
          email: student.email,
          course: student.course,
          presentDays: 15,
          totalDays: 20,
          attendanceRate: 75,
          period: period || 'Last 30 days',
          attendanceRecords: []
        };
      }

      const pdfBuffer = await pdfService.generateStudentAttendancePDF(attendanceData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${attendanceData.studentName.replace(/\s+/g, '-')}-${Date.now()}.pdf"`);
      res.send(pdfBuffer);

    } else {
      // Class summary
      if (useDatabase) {
        const students = await Student.find({ status: 'Active' });
        const recentSnapshots = await AttendanceSnapshot.find()
          .sort({ timestamp: -1 })
          .limit(30);

        attendanceData = {
          period: period || 'Last 30 days',
          totalStudents: students.length,
          averageAttendance: 78,
          presentToday: recentSnapshots[0]?.totalPresent || 0,
          absentToday: recentSnapshots[0]?.totalAbsent || 0,
          totalClassDays: recentSnapshots.length,
          students: await Promise.all(students.map(async (s) => {
            const attendanceRate = await calculateStudentAttendanceRate(s._id);
            const presentDays = Math.max(1, Math.floor(attendanceRate * recentSnapshots.length / 100));
            return {
              name: s.name,
              course: s.course,
              attendanceRate,
              presentDays
            };
          }))
        };
      } else {
        attendanceData = {
          period: period || 'Last 30 days',
          totalStudents: inMemoryStudents.length,
          averageAttendance: 78,
          presentToday: 5,
          absentToday: 2,
          totalClassDays: 20,
          students: inMemoryStudents.map(s => {
            const attendanceRate = calculateStudentAttendanceRate(s.id);
            const presentDays = Math.max(1, Math.floor(attendanceRate * 20 / 100));
            return {
              name: s.name,
              course: s.course,
              attendanceRate,
              presentDays
            };
          })
        };
      }

      const pdfBuffer = await pdfService.generateClassSummaryPDF(attendanceData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="class-attendance-summary-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message });
  }
});

// Send PDF via email
app.post('/api/attendance/email-pdf', async (req, res) => {
  try {
    const { recipientEmail, studentId, reportType, period } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    let attendanceData;
    let pdfBuffer;

    if (reportType === 'individual' && studentId) {
      // Get individual student data and generate PDF
      if (useDatabase) {
        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const snapshots = await AttendanceSnapshot.find({
          $or: [
            { 'presentStudents.studentId': studentId },
            { 'absentStudents.studentId': studentId }
          ]
        }).sort({ timestamp: -1 }).limit(30);

        const presentDays = snapshots.filter(s => 
          s.presentStudents.some(p => p.studentId.toString() === studentId)
        ).length;

        const totalDays = snapshots.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        attendanceData = {
          studentName: student.name,
          email: student.email,
          course: student.course,
          presentDays,
          totalDays,
          attendanceRate,
          period: period || 'Last 30 days',
          attendanceRecords: snapshots.map(s => ({
            date: s.timestamp.toLocaleDateString(),
            status: s.presentStudents.some(p => p.studentId.toString() === studentId) ? 'Present' : 'Absent',
            timeIn: s.timestamp.toLocaleTimeString(),
            notes: ''
          }))
        };
      } else {
        const student = inMemoryStudents.find(s => s.id === studentId);
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
        }

        attendanceData = {
          studentName: student.name,
          email: student.email,
          course: student.course,
          presentDays: 15,
          totalDays: 20,
          attendanceRate: 75,
          period: period || 'Last 30 days',
          attendanceRecords: []
        };
      }

      pdfBuffer = await pdfService.generateStudentAttendancePDF(attendanceData);
    } else {
      // Class summary
      if (useDatabase) {
        const students = await Student.find({ status: 'Active' });
        const recentSnapshots = await AttendanceSnapshot.find()
          .sort({ timestamp: -1 })
          .limit(30);

        attendanceData = {
          period: period || 'Last 30 days',
          totalStudents: students.length,
          averageAttendance: 78,
          presentToday: recentSnapshots[0]?.totalPresent || 0,
          absentToday: recentSnapshots[0]?.totalAbsent || 0,
          totalClassDays: recentSnapshots.length,
          students: await Promise.all(students.map(async (s) => {
            const attendanceRate = await calculateStudentAttendanceRate(s._id);
            const presentDays = Math.max(1, Math.floor(attendanceRate * recentSnapshots.length / 100));
            return {
              name: s.name,
              course: s.course,
              attendanceRate,
              presentDays
            };
          }))
        };
      } else {
        attendanceData = {
          period: period || 'Last 30 days',
          totalStudents: inMemoryStudents.length,
          averageAttendance: 78,
          presentToday: 5,
          absentToday: 2,
          totalClassDays: 20,
          students: inMemoryStudents.map(s => {
            const attendanceRate = calculateStudentAttendanceRate(s.id);
            const presentDays = Math.max(1, Math.floor(attendanceRate * 20 / 100));
            return {
              name: s.name,
              course: s.course,
              attendanceRate,
              presentDays
            };
          })
        };
      }

      pdfBuffer = await pdfService.generateClassSummaryPDF(attendanceData);
    }

    // Initialize email service and send with PDF attachment
    if (currentSettings && currentSettings.emailConfig) {
      await emailService.initialize(currentSettings.emailConfig);
    }

    const result = await emailService.sendAttendanceReportWithPDF(recipientEmail, attendanceData, pdfBuffer, reportType);
    res.json({ success: true, message: 'Email with PDF sent successfully', messageId: result.messageId });

  } catch (error) {
    console.error('Error sending email with PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to send email with PDF', error: error.message });
  }
});

// Test email configuration
app.post('/api/settings/email/test', async (req, res) => {
  try {
    const { emailConfig, testEmail } = req.body;

    if (!emailConfig || !testEmail) {
      return res.status(400).json({ success: false, message: 'Email config and test email are required' });
    }

    const testResult = await emailService.testEmailConfig(emailConfig);
    
    if (testResult.success) {
      // Send test email
      await emailService.initialize(emailConfig);
      const testData = {
        studentName: 'Test Student',
        course: 'Test Course',
        presentDays: 15,
        totalDays: 20,
        attendanceRate: 75,
        period: 'Test Period',
        email: testEmail
      };

      await emailService.sendAttendanceReport(testEmail, testData, 'individual');
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      res.status(400).json({ success: false, message: testResult.message });
    }

  } catch (error) {
    console.error('Error testing email configuration:', error);
    res.status(500).json({ success: false, message: 'Failed to test email configuration', error: error.message });
  }
});

// Debug endpoint to test current email configuration
app.get('/api/debug/email', async (req, res) => {
  try {
    console.log('🔍 Debug: Testing current email configuration');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'undefined');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email credentials not configured',
        debug: {
          hasUser: !!process.env.EMAIL_USER,
          hasPassword: !!process.env.EMAIL_PASSWORD
        }
      });
    }

    // Test with current environment config
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD
    };

    // Initialize and test
    await emailService.initialize(emailConfig);
    
    // Send test email to yourself
    const testData = {
      studentName: 'Debug Test',
      email: process.env.EMAIL_USER,
      course: 'Test Course',
      presentDays: 15,
      totalDays: 20,
      attendanceRate: 75,
      period: 'Debug Test',
      attendanceRecords: []
    };

    await emailService.sendAttendanceReport(process.env.EMAIL_USER, testData, 'individual');
    
    res.json({ 
      success: true, 
      message: 'Debug email sent successfully to ' + process.env.EMAIL_USER 
    });

  } catch (error) {
    console.error('❌ Debug email test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Debug email test failed', 
      error: error.message,
      code: error.code
    });
  }
});

// Debug endpoint to check attendance snapshots
app.get('/api/debug/attendance', async (req, res) => {
  try {
    if (useDatabase) {
      const totalSnapshots = await AttendanceSnapshot.countDocuments();
      const recentSnapshots = await AttendanceSnapshot.find()
        .sort({ timestamp: -1 })
        .limit(5)
        .select('timestamp totalPresent totalAbsent scrapedMACs');
      
      const totalStudents = await Student.countDocuments({ status: 'Active' });
      
      res.json({
        success: true,
        database: true,
        totalSnapshots,
        totalStudents,
        recentSnapshots,
        message: totalSnapshots === 0 ? 'No attendance snapshots found - scraper may not be running' : 'Attendance data found'
      });
    } else {
      res.json({
        success: true,
        database: false,
        totalSnapshots: inMemorySnapshots.length,
        totalStudents: inMemoryStudents.length,
        recentSnapshots: inMemorySnapshots.slice(-5),
        message: inMemorySnapshots.length === 0 ? 'No attendance snapshots found - scraper may not be running' : 'In-memory attendance data found'
      });
    }
  } catch (error) {
    console.error('❌ Debug attendance check failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Debug attendance check failed', 
      error: error.message
    });
  }
});

// Export student list as PDF
app.get('/api/students/export/pdf', async (req, res) => {
  try {
    let studentsData = [];

    if (useDatabase) {
      const students = await Student.find({ status: 'Active' });
      // Calculate real attendance rates for each student
      studentsData = await Promise.all(
        students.map(async (s) => {
          const attendanceRate = await calculateStudentAttendanceRate(s._id);
          return {
            name: s.name,
            email: s.email,
            course: s.course,
            macAddress: s.macAddress,
            joinDate: s.joinDate ? s.joinDate.toLocaleDateString() : 'N/A',
            status: s.status,
            attendanceRate
          };
        })
      );
    } else {
      studentsData = inMemoryStudents.map(s => {
        const attendanceRate = calculateStudentAttendanceRate(s.id);
        return {
          name: s.name,
          email: s.email,
          course: s.course,
          macAddress: s.macAddress,
          joinDate: s.joinDate || 'N/A',
          status: s.status,
          attendanceRate
        };
      });
    }

    const studentListData = {
      title: 'Student List Report',
      generatedDate: new Date().toLocaleDateString(),
      totalStudents: studentsData.length,
      students: studentsData
    };

    const pdfBuffer = await pdfService.generateStudentListPDF(studentListData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="student-list-${Date.now()}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating student list PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message });
  }
});

// Send student list via email
app.post('/api/students/export/email', async (req, res) => {
  try {
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    let studentsData = [];

    if (useDatabase) {
      const students = await Student.find({ status: 'Active' });
      // Calculate real attendance rates for each student
      studentsData = await Promise.all(
        students.map(async (s) => {
          const attendanceRate = await calculateStudentAttendanceRate(s._id);
          return {
            name: s.name,
            email: s.email,
            course: s.course,
            macAddress: s.macAddress,
            joinDate: s.joinDate ? s.joinDate.toLocaleDateString() : 'N/A',
            status: s.status,
            attendanceRate
          };
        })
      );
    } else {
      studentsData = inMemoryStudents.map(s => {
        const attendanceRate = calculateStudentAttendanceRate(s.id);
        return {
          name: s.name,
          email: s.email,
          course: s.course,
          macAddress: s.macAddress,
          joinDate: s.joinDate || 'N/A',
          status: s.status,
          attendanceRate
        };
      });
    }

    const studentListData = {
      title: 'Student List Report',
      generatedDate: new Date().toLocaleDateString(),
      totalStudents: studentsData.length,
      students: studentsData
    };

    // Generate PDF
    const pdfBuffer = await pdfService.generateStudentListPDF(studentListData);

    // Send email with PDF attachment
    if (currentSettings && currentSettings.emailConfig) {
      await emailService.initialize(currentSettings.emailConfig);
    }

    await emailService.sendStudentListWithPDF(recipientEmail, studentListData, pdfBuffer);
    res.json({ success: true, message: 'Student list sent successfully' });

  } catch (error) {
    console.error('Error sending student list email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// Seed admin function
const initializeAdmin = async () => {
  try {
    if (useDatabase) {
      // Database mode - use the imported seedAdmin function
      if (seedAdmin) {
        await seedAdmin();
      }
    } else {
      // In-memory mode - admin already exists in the authentication logic
      console.log('✅ Admin seeding not needed in memory mode');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

// ==================== ADMIN DATA RESET ENDPOINTS ====================

// Reset attendance data for different time periods
app.post('/api/admin/reset-attendance', async (req, res) => {
  try {
    const { period, confirmReset } = req.body;

    if (!confirmReset) {
      return res.status(400).json({ success: false, message: 'Reset confirmation required' });
    }

    if (useDatabase) {
      let deleteQuery = {};
      const now = new Date();

      switch (period) {
        case 'week':
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          deleteQuery = { timestamp: { $gte: oneWeekAgo } };
          break;
        case 'month':
          const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          deleteQuery = { timestamp: { $gte: oneMonthAgo } };
          break;
        case 'all':
          deleteQuery = {}; // Delete all attendance snapshots
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid period specified' });
      }

      const result = await AttendanceSnapshot.deleteMany(deleteQuery);
      
      res.json({
        success: true,
        message: `Successfully reset attendance data for ${period}`,
        deletedCount: result.deletedCount
      });
    } else {
      // In-memory mode - reset attendance history
      inMemoryAttendanceHistory = [];
      res.json({
        success: true,
        message: `Successfully reset attendance data for ${period}`,
        deletedCount: 'N/A (in-memory mode)'
      });
    }
  } catch (error) {
    console.error('Error resetting attendance data:', error);
    res.status(500).json({ success: false, message: 'Failed to reset attendance data', error: error.message });
  }
});

// Reset all student data
app.post('/api/admin/reset-students', async (req, res) => {
  try {
    const { confirmReset } = req.body;

    if (!confirmReset) {
      return res.status(400).json({ success: false, message: 'Reset confirmation required' });
    }

    if (useDatabase) {
      // Reset students and their attendance data
      const studentResult = await Student.deleteMany({});
      const attendanceResult = await AttendanceSnapshot.deleteMany({});
      
      res.json({
        success: true,
        message: 'Successfully reset all student and attendance data',
        deletedStudents: studentResult.deletedCount,
        deletedAttendanceRecords: attendanceResult.deletedCount
      });
    } else {
      // In-memory mode
      inMemoryStudents.splice(0); // Clear array
      inMemoryAttendanceHistory = [];
      
      res.json({
        success: true,
        message: 'Successfully reset all student and attendance data',
        deletedStudents: 'All (in-memory mode)',
        deletedAttendanceRecords: 'All (in-memory mode)'
      });
    }
  } catch (error) {
    console.error('Error resetting student data:', error);
    res.status(500).json({ success: false, message: 'Failed to reset student data', error: error.message });
  }
});

// Get system statistics for admin dashboard
app.get('/api/admin/system-stats', async (req, res) => {
  try {
    let stats;

    if (useDatabase) {
      const totalStudents = await Student.countDocuments();
      const activeStudents = await Student.countDocuments({ status: 'Active' });
      const totalSnapshots = await AttendanceSnapshot.countDocuments();
      
      // Get latest snapshot for today's data
      const latestSnapshot = await AttendanceSnapshot.findOne().sort({ timestamp: -1 });
      
      stats = {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents,
        totalAttendanceRecords: totalSnapshots,
        lastSnapshotTime: latestSnapshot?.timestamp || null,
        todayPresent: latestSnapshot?.totalPresent || 0,
        todayAbsent: latestSnapshot?.totalAbsent || 0
      };
    } else {
      stats = {
        totalStudents: inMemoryStudents.length,
        activeStudents: inMemoryStudents.filter(s => s.status === 'Active').length,
        inactiveStudents: inMemoryStudents.filter(s => s.status !== 'Active').length,
        totalAttendanceRecords: inMemoryAttendanceHistory.length,
        lastSnapshotTime: inMemoryAttendanceHistory.length > 0 ? 
          inMemoryAttendanceHistory[inMemoryAttendanceHistory.length - 1].timestamp : null,
        todayPresent: 0,
        todayAbsent: 0
      };
    }

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get system stats', error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Load settings and seed admin
  await loadSettings();
  await initializeAdmin();
  
  // Initialize email service with environment variables
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      const emailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM_ADDRESS || 'noreply@schooltracker.com'
      };
      await emailService.initialize(emailConfig);
      console.log('✅ Email service initialized with environment config');
    } catch (error) {
      console.log('⚠️ Failed to initialize email service:', error.message);
    }
  } else {
    console.log('⚠️ Email credentials not found in environment variables');
  }
  
  // Start periodic scraping if auto-snapshot is enabled
  if (currentSettings && currentSettings.autoSnapshot) {
    try {
      const scraperInstance = getScraper();
      if (scraperInstance) {
        await scraperInstance.startPeriodicScraping(currentSettings.snapshotInterval, processScrapedMACs);
        console.log('✅ Automatic attendance tracking started');
      } else {
        console.log('⚠️ Scraper not available, automatic tracking disabled');
      }
    } catch (error) {
      console.error('❌ Failed to start scraping:', error);
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (scraper) {
    await scraper.close();
  }
  process.exit(0);
});