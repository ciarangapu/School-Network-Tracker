import mongoose from 'mongoose';

const attendanceSnapshotSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  scrapedMACs: [{
    type: String,
    uppercase: true
  }],
  presentStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    name: String,
    macAddress: String,
    course: String,
    email: String
  }],
  absentStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    name: String,
    macAddress: String,
    course: String,
    email: String
  }],
  totalScraped: {
    type: Number,
    default: 0
  },
  totalPresent: {
    type: Number,
    default: 0
  },
  totalAbsent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
attendanceSnapshotSchema.index({ timestamp: -1 });
attendanceSnapshotSchema.index({ 'presentStudents.studentId': 1 });

export default mongoose.model('AttendanceSnapshot', attendanceSnapshotSchema);