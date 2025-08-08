import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  snapshotInterval: {
    type: Number,
    default: 15,
    min: 1,
    max: 60
  },
  attendanceThreshold: {
    type: Number,
    default: 60,
    min: 1,
    max: 100
  },
  lateThreshold: {
    type: Number,
    default: 15,
    min: 1,
    max: 60
  },
  autoSnapshot: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  weeklyReports: {
    type: Boolean,
    default: true
  },
  monthlyReports: {
    type: Boolean,
    default: true
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '18:00'
    }
  },
  graceTime: {
    type: Number,
    default: 5,
    min: 0,
    max: 30
  },
  minPresenceTime: {
    type: Number,
    default: 30,
    min: 1,
    max: 480
  },
  emailConfig: {
    host: {
      type: String,
      default: 'smtp.gmail.com'
    },
    port: {
      type: Number,
      default: 587
    },
    secure: {
      type: Boolean,
      default: false
    },
    user: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    },
    from: {
      type: String,
      default: 'noreply@schooltracker.com'
    }
  },
  pdfSettings: {
    includeCharts: {
      type: Boolean,
      default: true
    },
    includeDetails: {
      type: Boolean,
      default: true
    },
    logoUrl: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);