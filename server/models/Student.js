import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  macAddress: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v);
      },
      message: 'Invalid MAC address format'
    }
  },
  course: {
    type: String,
    required: true,
    enum: [
      'Full Stack Development',
      'IT Networking',
      'DevOps',
      'Intern',
      'Digital Marketing',
      'Cloud Computing'
    ]
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastMacUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ macAddress: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ course: 1 });

export default mongoose.model('Student', studentSchema);