// models/Attendance.js
// NEW MODULE - Attendance tracking with geo-location support
// Integrates with existing User and Company models

const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References existing User model
    required: true,
  },
  date: {
    type: Date,
    required: true,
    set: (v) => new Date(v.setHours(0,0,0,0))
  },
  checkIn: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    isWithinOffice: { type: Boolean, default: false },
    deviceInfo: String
  },
  checkOut: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    isWithinOffice: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND'],
    default: 'ABSENT'
  },
  workHours: { type: Number, default: 0 }, // in minutes
  overtimeHours: { type: Number, default: 0 },
  notes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isManualEntry: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Compound index for unique daily attendance
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

AttendanceSchema.index({ status: 1 });

// Virtual for formatted work hours
AttendanceSchema.virtual('formattedWorkHours').get(function() {
  const hours = Math.floor(this.workHours / 60);
  const mins = this.workHours % 60;
  return `${hours}h ${mins}m`;
});

// Static method to check if location is within office radius
AttendanceSchema.statics.isWithinOfficeRadius = function(userLat, userLng, officeLat, officeLng, radiusKm = 0.1) {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(officeLat - userLat);
  const dLng = toRad(officeLng - userLng);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(userLat)) * Math.cos(toRad(officeLat)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= radiusKm;
};

// Calculate work hours on save
AttendanceSchema.pre('save', function(next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const diff = this.checkOut.time - this.checkIn.time;
    this.workHours = Math.round(diff / (1000 * 60)); // Convert to minutes
  }
  next();
});

module.exports = mongoose.model('Attendance', AttendanceSchema);