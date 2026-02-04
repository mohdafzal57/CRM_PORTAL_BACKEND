// models/WorkReport.js
// NEW MODULE - Daily work/task reports from employees
// Integrates with existing User model

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
    default: 'PENDING'
  },
  hoursSpent: { type: Number, default: 0 },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  }
});

const WorkReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References existing User model
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  tasks: [TaskSchema],
  summary: {
    type: String,
    maxlength: 2000
  },
  challenges: String,
  plannedForTomorrow: String,
  totalHoursWorked: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED'],
    default: 'DRAFT'
  },
  adminReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String,
    rating: { type: Number, min: 1, max: 5 }
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

// Compound index for unique daily report per user
WorkReportSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate total hours before save
WorkReportSchema.pre('save', function(next) {
  if (this.tasks?.length > 0) {
    this.totalHoursWorked = this.tasks.reduce((sum, task) => sum + (task.hoursSpent || 0), 0);
  }
  next();
});

// Static method to get pending reports count
WorkReportSchema.statics.getPendingCount = async function() {
  return this.countDocuments({ status: 'SUBMITTED' });
};

module.exports = mongoose.model('WorkReport', WorkReportSchema);