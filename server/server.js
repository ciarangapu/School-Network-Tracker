import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MacScraper from '../scraper/scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database later)
let students = [
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

let attendanceSnapshots = [];
let attendanceSettings = {
  snapshotInterval: 15,
  attendanceThreshold: 60,
  lateThreshold: 15,
  autoSnapshot: true,
  workingHours: {
    start: '09:00',
    end: '18:00'
  }
};

// Initialize scraper
const scraper = new MacScraper();

// Process scraped MAC addresses
const processScrapedMACs = async (scrapedData) => {
  console.log(`📊 Processing ${scrapedData.count} MAC addresses at ${scrapedData.timestamp}`);
  
  // Create attendance snapshot
  const snapshot = {
    id: Date.now(),
    timestamp: scrapedData.timestamp,
    scrapedMACs: scrapedData.macAddresses,
    presentStudents: [],
    absentStudents: []
  };

  // Check which students are present
  students.forEach(student => {
    const isPresent = scrapedData.macAddresses.some(mac => 
      mac.toLowerCase().replace(/[:-]/g, '') === 
      student.macAddress.toLowerCase().replace(/[:-]/g, '')
    );

    if (isPresent) {
      snapshot.presentStudents.push({
        id: student.id,
        name: student.name,
        macAddress: student.macAddress,
        course: student.course
      });
    } else {
      snapshot.absentStudents.push({
        id: student.id,
        name: student.name,
        macAddress: student.macAddress,
        course: student.course
      });
    }
  });

  attendanceSnapshots.push(snapshot);
  
  // Keep only last 1000 snapshots to prevent memory issues
  if (attendanceSnapshots.length > 1000) {
    attendanceSnapshots = attendanceSnapshots.slice(-1000);
  }

  console.log(`✅ Snapshot created: ${snapshot.presentStudents.length} present, ${snapshot.absentStudents.length} absent`);
  
  return snapshot;
};

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password, macAddress, userType } = req.body;

  if (userType === 'admin') {
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
  } else {
    // Student login with MAC address
    const student = students.find(s => 
      s.macAddress.toLowerCase().replace(/[:-]/g, '') === 
      macAddress.toLowerCase().replace(/[:-]/g, '')
    );

    if (student) {
      res.json({
        success: true,
        user: {
          id: student.id,
          name: student.name,
          macAddress: student.macAddress,
          course: student.course,
          role: 'student'
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'MAC address not found' });
    }
  }
});

// Student registration
app.post('/api/auth/register', (req, res) => {
  const { name, macAddress, course } = req.body;

  // Check if MAC address already exists
  const existingStudent = students.find(s => 
    s.macAddress.toLowerCase().replace(/[:-]/g, '') === 
    macAddress.toLowerCase().replace(/[:-]/g, '')
  );

  if (existingStudent) {
    return res.status(400).json({ success: false, message: 'MAC address already registered' });
  }

  const newStudent = {
    id: Date.now(),
    name,
    macAddress,
    course,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  };

  students.push(newStudent);
  res.json({ success: true, student: newStudent });
});

// Get students (admin only)
app.get('/api/students', (req, res) => {
  res.json(students);
});

// Update student MAC address
app.put('/api/students/:id/mac', (req, res) => {
  const { id } = req.params;
  const { currentMac, newMac } = req.body;

  const student = students.find(s => s.id == id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Verify current MAC address
  if (student.macAddress.toLowerCase().replace(/[:-]/g, '') !== 
      currentMac.toLowerCase().replace(/[:-]/g, '')) {
    return res.status(400).json({ success: false, message: 'Current MAC address does not match' });
  }

  // Check if new MAC is already in use
  const existingStudent = students.find(s => 
    s.id != id && 
    s.macAddress.toLowerCase().replace(/[:-]/g, '') === 
    newMac.toLowerCase().replace(/[:-]/g, '')
  );

  if (existingStudent) {
    return res.status(400).json({ success: false, message: 'New MAC address already in use' });
  }

  student.macAddress = newMac;
  res.json({ success: true, student });
});

// Get attendance snapshots
app.get('/api/attendance/snapshots', (req, res) => {
  const { startDate, endDate, studentId } = req.query;
  
  let filteredSnapshots = attendanceSnapshots;

  if (startDate || endDate) {
    filteredSnapshots = attendanceSnapshots.filter(snapshot => {
      const snapshotDate = new Date(snapshot.timestamp);
      if (startDate && snapshotDate < new Date(startDate)) return false;
      if (endDate && snapshotDate > new Date(endDate)) return false;
      return true;
    });
  }

  if (studentId) {
    // Filter for specific student
    filteredSnapshots = filteredSnapshots.map(snapshot => ({
      ...snapshot,
      isPresent: snapshot.presentStudents.some(s => s.id == studentId),
      studentData: snapshot.presentStudents.find(s => s.id == studentId) || 
                   snapshot.absentStudents.find(s => s.id == studentId)
    }));
  }

  res.json(filteredSnapshots);
});

// Get attendance summary
app.get('/api/attendance/summary', (req, res) => {
  const { studentId, startDate, endDate } = req.query;
  
  let relevantSnapshots = attendanceSnapshots;
  
  if (startDate || endDate) {
    relevantSnapshots = attendanceSnapshots.filter(snapshot => {
      const snapshotDate = new Date(snapshot.timestamp);
      if (startDate && snapshotDate < new Date(startDate)) return false;
      if (endDate && snapshotDate > new Date(endDate)) return false;
      return true;
    });
  }

  if (studentId) {
    // Summary for specific student
    const presentCount = relevantSnapshots.filter(s => 
      s.presentStudents.some(p => p.id == studentId)
    ).length;
    
    const totalSnapshots = relevantSnapshots.length;
    const attendanceRate = totalSnapshots > 0 ? (presentCount / totalSnapshots * 100).toFixed(1) : 0;

    res.json({
      studentId: parseInt(studentId),
      totalSnapshots,
      presentCount,
      absentCount: totalSnapshots - presentCount,
      attendanceRate: parseFloat(attendanceRate)
    });
  } else {
    // Overall summary
    const totalStudents = students.length;
    const latestSnapshot = relevantSnapshots[relevantSnapshots.length - 1];
    
    res.json({
      totalStudents,
      totalSnapshots: relevantSnapshots.length,
      currentPresent: latestSnapshot ? latestSnapshot.presentStudents.length : 0,
      currentAbsent: latestSnapshot ? latestSnapshot.absentStudents.length : 0,
      lastUpdate: latestSnapshot ? latestSnapshot.timestamp : null
    });
  }
});

// Get/Update attendance settings
app.get('/api/settings', (req, res) => {
  res.json(attendanceSettings);
});

app.put('/api/settings', async (req, res) => {
  const newSettings = { ...attendanceSettings, ...req.body };
  attendanceSettings = newSettings;

  // Restart scraping with new interval if auto-snapshot is enabled
  if (attendanceSettings.autoSnapshot) {
    scraper.stopPeriodicScraping();
    await scraper.startPeriodicScraping(attendanceSettings.snapshotInterval, processScrapedMACs);
  }

  res.json(attendanceSettings);
});

// Manual snapshot trigger
app.post('/api/attendance/snapshot', async (req, res) => {
  try {
    const scrapedData = await scraper.scrapeMACs();
    const snapshot = await processScrapedMACs(scrapedData);
    res.json({ success: true, snapshot });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current connected MACs (for testing)
app.get('/api/scraper/current', async (req, res) => {
  try {
    const scrapedData = await scraper.scrapeMACs();
    res.json(scrapedData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start periodic scraping if auto-snapshot is enabled
  if (attendanceSettings.autoSnapshot) {
    try {
      await scraper.startPeriodicScraping(attendanceSettings.snapshotInterval, processScrapedMACs);
      console.log('✅ Automatic attendance tracking started');
    } catch (error) {
      console.error('❌ Failed to start scraping:', error);
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await scraper.close();
  process.exit(0);
});