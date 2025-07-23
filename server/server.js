import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import MacScraper from '../scraper/scraper.js';

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
        const student = await Student.findOne({ 
          macAddress: { $regex: new RegExp(macAddress.replace(/[:-]/g, ''), 'i') },
          status: 'Active'
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
      res.json(students);
    } else {
      // Return in-memory students sorted by creation date
      const sortedStudents = inMemoryStudents.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      res.json(sortedStudents);
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

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Load settings and seed admin
  await loadSettings();
  await initializeAdmin();
  
  // Start periodic scraping if auto-snapshot is enabled
  if (currentSettings && currentSettings.autoSnapshot) {
    try {
      const scraperInstance = getScraper();
      await scraperInstance.startPeriodicScraping(currentSettings.snapshotInterval, processScrapedMACs);
      console.log('✅ Automatic attendance tracking started');
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