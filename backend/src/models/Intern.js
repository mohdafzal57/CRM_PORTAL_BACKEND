/**
 * Intern Model
 * Stores detailed information for users with the INTERN role
 */

const mongoose = require('mongoose');

const internSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    internId: {
        type: String,
        unique: true,
        required: true
    },
    // Personal Details
    personal: {
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        dob: { type: Date },
        photo: { type: String } // Path to passport size photo
    },
    // Academic Details
    education: {
        collegeName: { type: String },
        course: { type: String }, // BCA, BTech, MCA, etc.
        branch: { type: String }, // Branch/Specialization
        yearSemester: { type: String },
        collegeIdNumber: { type: String }
    },
    // Internship Details
    internship: {
        domain: { type: String }, // Web Dev, Cyber Security, etc.
        type: { type: String }, // Summer, Winter, 3 Months, etc.
        startDate: { type: Date },
        endDate: { type: Date },
        mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'] },
        assignedBatch: { type: String },
        assignedMentor: { type: String },
        dailyWorkingHours: { type: Number }
    },
    // Progress Tracking
    academicWork: {
        dailyTaskUpdate: [{
            date: { type: Date, default: Date.now },
            task: { type: String },
            status: { type: String }
        }],
        attendanceStatus: { type: String },
        weeklyProgressReport: [{
            weekNumber: { type: Number },
            report: { type: String },
            submittedAt: { type: Date, default: Date.now }
        }],
        mentorFeedback: [{
            mentor: { type: String },
            feedback: { type: String },
            date: { type: Date, default: Date.now }
        }]
    },
    // Project Details
    projectWork: {
        finalProjectSubmitted: { type: Boolean, default: false },
        projectTitle: { type: String }
    },
    // Tasks assigned by Admin/Mentor
    assignedTasks: [{
        title: { type: String, required: true },
        description: { type: String },
        assignedDate: { type: Date, default: Date.now },
        dueDate: { type: Date },
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Intern', internSchema);
