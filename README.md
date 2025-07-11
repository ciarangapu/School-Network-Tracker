# MAC Address Attendance Tracker

A comprehensive attendance tracking system that uses MAC address detection to automatically track student attendance.

## Features

- **Dual Authentication System**
  - Admin login with email/password
  - Student login with MAC address
  
- **Student Management**
  - Student registration with course selection
  - MAC address validation and updates
  - Course options: Full Stack Development, IT Networking, DevOps, Intern, Digital Marketing, Cloud Computing

- **Attendance Tracking**
  - Automatic MAC address scraping from router
  - Configurable snapshot intervals
  - Real-time presence detection
  - Attendance calculation based on presence percentage

- **Reporting & Analytics**
  - Daily, weekly, and monthly attendance reports
  - Calendar-based filtering
  - Export to PDF and email sharing
  - Individual and group attendance summaries

- **Admin Dashboard**
  - Complete attendance management
  - Student management
  - System settings configuration
  - Group and shift management

- **Student Dashboard**
  - Personal attendance records
  - MAC address updates
  - Limited self-service capabilities

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

**Scraper:**
```bash
cd scraper
npm install
```

### 2. Configure Router Settings

Update the router credentials in `scraper/scraper.js`:
```javascript
const MODEM_URL = 'http://192.168.1.1/index.html';
const USERNAME = 'admin';  
const PASSWORD = 'admin';
```

### 3. Start the Services

**Start Backend Server:**
```bash
cd server
npm start
```

**Start Frontend:**
```bash
npm run dev
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Login Credentials

**Admin Access:**
- Email: `admin@example.com`
- Password: `admin123`

**Student Access:**
- Use any valid MAC address (e.g., `00:11:22:33:44:55`)
- Register new students at `/register`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration

### Students
- `GET /api/students` - Get all students (admin only)
- `PUT /api/students/:id/mac` - Update student MAC address

### Attendance
- `GET /api/attendance/snapshots` - Get attendance snapshots
- `GET /api/attendance/summary` - Get attendance summary
- `POST /api/attendance/snapshot` - Trigger manual snapshot

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

### Scraper
- `GET /api/scraper/current` - Get currently connected MACs

## How It Works

1. **MAC Address Scraping**: The system uses Puppeteer to log into your router and extract connected MAC addresses
2. **Snapshot System**: At configurable intervals, the system takes "snapshots" of connected devices
3. **Attendance Calculation**: Students are marked present if their MAC address appears in a sufficient percentage of snapshots
4. **Real-time Updates**: The frontend receives real-time updates about attendance status

## Configuration

### Attendance Settings
- **Snapshot Interval**: How often to check for connected devices (default: 15 minutes)
- **Attendance Threshold**: Minimum presence percentage to be marked present (default: 60%)
- **Working Hours**: Define the active tracking period
- **Grace Time**: Buffer time before marking students late

### Router Configuration
Make sure your router allows access to the station list endpoint and that the login credentials are correct.

## Development

The system is built with:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Scraper**: Puppeteer for web automation
- **Storage**: In-memory (easily replaceable with database)

## Next Steps

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MySQL
2. **Real-time Updates**: Implement WebSocket for live attendance updates
3. **Email Notifications**: Add SMTP configuration for email reports
4. **PDF Generation**: Implement server-side PDF generation
5. **Mobile App**: Create companion mobile application

## Troubleshooting

### Common Issues

1. **Scraper Login Fails**: Check router IP, username, and password
2. **No MAC Addresses Found**: Verify the station list URL is correct
3. **CORS Errors**: Ensure backend server is running on port 3001

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=true npm start
```

## License

MIT License - feel free to modify and distribute as needed.