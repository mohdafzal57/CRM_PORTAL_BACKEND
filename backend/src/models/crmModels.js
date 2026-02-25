/**
 * CRM Models
 * Lead, Deal, Contact, Activity schemas for CRM module
 */

const mongoose = require('mongoose');

// ============================================
// LEAD SCHEMA
// ============================================
const leadSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Lead name is required'],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: { 
        type: String,
        trim: true 
    },
    company: { 
        type: String,
        trim: true 
    },
    position: {
        type: String,
        trim: true
    },
    status: { 
        type: String, 
        enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'lost', 'converted'],
        default: 'new'
    },
    source: { 
        type: String,
        enum: ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'email_campaign', 'trade_show', 'other'],
        default: 'website'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    estimatedValue: {
        type: Number,
        default: 0
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    notes: { 
        type: String 
    },
    tags: [{
        type: String,
        trim: true
    }],
    lastContactedAt: {
        type: Date
    },
    nextFollowUp: {
        type: Date
    },
    convertedToContactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CRMContact'
    },
    convertedToDealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal'
    }
}, { 
    timestamps: true 
});

// Indexes for better query performance
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1 });

// ============================================
// DEAL SCHEMA
// ============================================
const dealSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Deal title is required'],
        trim: true 
    },
    value: { 
        type: Number, 
        required: [true, 'Deal value is required'],
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    stage: { 
        type: String, 
        enum: ['prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
        default: 'prospecting'
    },
    probability: { 
        type: Number, 
        default: 10,
        min: 0,
        max: 100
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    contact: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CRMContact'
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    expectedCloseDate: { 
        type: Date 
    },
    actualCloseDate: {
        type: Date
    },
    lostReason: {
        type: String,
        enum: ['price', 'competition', 'no_budget', 'timing', 'no_response', 'other'],
    },
    notes: { 
        type: String 
    },
    products: [{
        name: String,
        quantity: Number,
        price: Number
    }],
    competitors: [{
        name: String,
        strengths: String,
        weaknesses: String
    }]
}, { 
    timestamps: true 
});

// Indexes
dealSchema.index({ owner: 1, stage: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ createdAt: -1 });

// Auto-update probability based on stage
dealSchema.pre('save', function(next) {
    const stageProbabilities = {
        'prospecting': 10,
        'qualification': 20,
        'needs_analysis': 40,
        'proposal': 60,
        'negotiation': 80,
        'closed_won': 100,
        'closed_lost': 0
    };
    
    if (this.isModified('stage') && !this.isModified('probability')) {
        this.probability = stageProbabilities[this.stage] || this.probability;
    }
    
    if (this.stage === 'closed_won' || this.stage === 'closed_lost') {
        this.actualCloseDate = new Date();
    }
    
    next();
});

// ============================================
// CONTACT SCHEMA
// ============================================
const contactSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, 'First name is required'],
        trim: true 
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: { 
        type: String,
        trim: true 
    },
    mobile: {
        type: String,
        trim: true
    },
    company: { 
        type: String,
        trim: true 
    },
    position: { 
        type: String,
        trim: true 
    },
    department: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    socialProfiles: {
        linkedin: String,
        twitter: String,
        facebook: String
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CRMAccount'
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dateOfBirth: {
        type: Date
    },
    leadSource: {
        type: String
    }
}, { 
    timestamps: true 
});

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Indexes
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ createdAt: -1 });

// ============================================
// ACTIVITY SCHEMA (Tasks, Calls, Meetings, Emails)
// ============================================
const activitySchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['call', 'email', 'meeting', 'task', 'note', 'follow_up'],
        required: true 
    },
    title: { 
        type: String, 
        required: [true, 'Activity title is required'],
        trim: true 
    },
    description: { 
        type: String 
    },
    dueDate: { 
        type: Date 
    },
    dueTime: {
        type: String
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    completedAt: {
        type: Date
    },
    relatedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'relatedModel' 
    },
    relatedModel: { 
        type: String, 
        enum: ['Lead', 'Deal', 'CRMContact'] 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    outcome: {
        type: String
    },
    reminder: {
        type: Date
    }
}, { 
    timestamps: true 
});

// Indexes
activitySchema.index({ assignedTo: 1, completed: 1 });
activitySchema.index({ dueDate: 1 });
activitySchema.index({ relatedTo: 1, relatedModel: 1 });

// ============================================
// ACCOUNT SCHEMA (Companies/Organizations)
// ============================================
const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Account name is required'],
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    employees: {
        type: Number
    },
    annualRevenue: {
        type: Number
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['prospect', 'customer', 'partner', 'competitor', 'other'],
        default: 'prospect'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CRMAccount'
    }
}, {
    timestamps: true
});

// Indexes
accountSchema.index({ assignedTo: 1 });
accountSchema.index({ name: 1 });

// ============================================
// EXPORT MODELS
// ============================================
const Lead = mongoose.model('Lead', leadSchema);
const Deal = mongoose.model('Deal', dealSchema);
const CRMContact = mongoose.model('CRMContact', contactSchema);
const Activity = mongoose.model('Activity', activitySchema);
const CRMAccount = mongoose.model('CRMAccount', accountSchema);

module.exports = {
    Lead,
    Deal,
    CRMContact,
    Activity,
    CRMAccount
};