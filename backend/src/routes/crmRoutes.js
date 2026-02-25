/**
 * CRM Routes
 * Complete CRUD operations for Leads, Deals, Contacts, Activities
 * Role-based access control integrated
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Lead, Deal, CRMContact, Activity, CRMAccount } = require('../models/crmModels');
const User = require('../models/User');

// Import auth middleware from your existing system
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build query based on user role
 * - ADMIN: See all data
 * - MANAGER/HR: See team data
 * - SALES/EMPLOYEE: See only assigned data
 * - SUPPORT/INTERN: Read-only, own data
 */
const buildRoleQuery = async (user, assignedField = 'assignedTo') => {
    const role = user.role?.toUpperCase();
    
    switch (role) {
        case 'ADMIN':
            return {}; // Admin sees everything
        
        case 'MANAGER':
        case 'HR':
            // Manager/HR sees their team's data
            const teamMembers = await User.find({ 
                $or: [
                    { manager: user._id },
                    { department: user.department }
                ]
            }).select('_id');
            const teamIds = [user._id, ...teamMembers.map(m => m._id)];
            return { [assignedField]: { $in: teamIds } };
        
        case 'EMPLOYEE':
        case 'SALES':
        case 'SUPPORT':
        case 'INTERN':
        default:
            return { [assignedField]: user._id };
    }
};

/**
 * Check if user can modify (write access)
 */
const canWrite = (role) => {
    const writeRoles = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'];
    return writeRoles.includes(role?.toUpperCase());
};

/**
 * Check if user can delete
 */
const canDelete = (role) => {
    const deleteRoles = ['ADMIN', 'MANAGER', 'HR'];
    return deleteRoles.includes(role?.toUpperCase());
};

// ============================================
// DASHBOARD STATS
// ============================================
router.get('/dashboard/stats', protect, async (req, res) => {
        
    try {
        const userId = req.user._id;
        const role = req.user.role?.toUpperCase();

        let leadQuery = await buildRoleQuery(req.user, 'assignedTo');
        let dealQuery = await buildRoleQuery(req.user, 'owner');

        // Get various stats
        const [
            totalLeads,
            newLeads,
            contactedLeads,
            qualifiedLeads,
            convertedLeads,
            totalDeals,
            openDeals,
            wonDeals,
            lostDeals,
            totalDealValue,
            wonDealValue,
            totalContacts,
            pendingActivities,
            todayActivities,
            overdueActivities
        ] = await Promise.all([
            Lead.countDocuments(leadQuery),
            Lead.countDocuments({ ...leadQuery, status: 'new' }),
            Lead.countDocuments({ ...leadQuery, status: 'contacted' }),
            Lead.countDocuments({ ...leadQuery, status: 'qualified' }),
            Lead.countDocuments({ ...leadQuery, status: 'converted' }),
            Deal.countDocuments(dealQuery),
            Deal.countDocuments({ ...dealQuery, stage: { $nin: ['closed_won', 'closed_lost'] } }),
            Deal.countDocuments({ ...dealQuery, stage: 'closed_won' }),
            Deal.countDocuments({ ...dealQuery, stage: 'closed_lost' }),
            Deal.aggregate([
                { $match: dealQuery },
                { $group: { _id: null, total: { $sum: '$value' } } }
            ]),
            Deal.aggregate([
                { $match: { ...dealQuery, stage: 'closed_won' } },
                { $group: { _id: null, total: { $sum: '$value' } } }
            ]),
            CRMContact.countDocuments(await buildRoleQuery(req.user)),
            Activity.countDocuments({ 
                assignedTo: userId, 
                completed: false,
                dueDate: { $gte: new Date() }
            }),
            Activity.countDocuments({
                assignedTo: userId,
                dueDate: {
                    $gte: new Date().setHours(0, 0, 0, 0),
                    $lt: new Date().setHours(23, 59, 59, 999)
                }
            }),
            Activity.countDocuments({
                assignedTo: userId,
                completed: false,
                dueDate: { $lt: new Date() }
            })
        ]);

        // Get recent leads
        const recentLeads = await Lead.find(leadQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('assignedTo', 'fullName email');

        // Get deal pipeline
        const pipeline = await Deal.aggregate([
            { $match: dealQuery },
            { 
                $group: { 
                    _id: '$stage', 
                    count: { $sum: 1 }, 
                    value: { $sum: '$value' } 
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        // Get upcoming activities
        const upcomingActivities = await Activity.find({
            assignedTo: userId,
            completed: false,
            dueDate: { $gte: new Date() }
        })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('relatedTo');

        // Monthly trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyLeads = await Lead.aggregate([
            { 
                $match: { 
                    ...leadQuery, 
                    createdAt: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: { 
                        month: { $month: '$createdAt' }, 
                        year: { $year: '$createdAt' } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthlyDeals = await Deal.aggregate([
            { 
                $match: { 
                    ...dealQuery, 
                    stage: 'closed_won',
                    createdAt: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: { 
                        month: { $month: '$createdAt' }, 
                        year: { $year: '$createdAt' } 
                    },
                    count: { $sum: 1 },
                    value: { $sum: '$value' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                leads: {
                    total: totalLeads,
                    new: newLeads,
                    contacted: contactedLeads,
                    qualified: qualifiedLeads,
                    converted: convertedLeads,
                    conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0
                },
                deals: {
                    total: totalDeals,
                    open: openDeals,
                    won: wonDeals,
                    lost: lostDeals,
                    totalValue: totalDealValue[0]?.total || 0,
                    wonValue: wonDealValue[0]?.total || 0,
                    winRate: (wonDeals + lostDeals) > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(1) : 0
                },
                contacts: {
                    total: totalContacts
                },
                activities: {
                    pending: pendingActivities,
                    today: todayActivities,
                    overdue: overdueActivities
                },
                recentLeads,
                pipeline,
                upcomingActivities,
                trends: {
                    leads: monthlyLeads,
                    deals: monthlyDeals
                }
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============================================
// LEAD ROUTES
// ============================================

// Get all leads with filtering, search, pagination
router.get('/leads', protect, async (req, res) => {
    try {
        const { 
            status, 
            source, 
            priority,
            search, 
            page = 1, 
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            startDate,
            endDate
        } = req.query;
        
        let query = await buildRoleQuery(req.user);
        
        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Filter by source
        if (source && source !== 'all') {
            query.source = source;
        }

        // Filter by priority
        if (priority && priority !== 'all') {
            query.priority = priority;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await Lead.countDocuments(query);
        const leads = await Lead.find(query)
            .populate('assignedTo', 'fullName email avatar')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                leads,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single lead
router.get('/leads/:id', protect, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'fullName email avatar')
            .populate('convertedToContactId')
            .populate('convertedToDealId');
        
        if (!lead) {
            return res.status(404).json({ 
                success: false, 
                message: 'Lead not found' 
            });
        }

        // Check access
        const role = req.user.role?.toUpperCase();
        if (!['ADMIN', 'MANAGER', 'HR'].includes(role) && 
            lead.assignedTo._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to view this lead' 
            });
        }

        // Get related activities
        const activities = await Activity.find({ 
            relatedTo: lead._id, 
            relatedModel: 'Lead' 
        })
        .sort({ createdAt: -1 })
        .limit(10);

        res.json({ 
            success: true, 
            data: { lead, activities } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create lead
router.post('/leads', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to create leads' 
            });
        }

        const leadData = {
            ...req.body,
            assignedTo: req.body.assignedTo || req.user._id
        };

        const lead = await Lead.create(leadData);
        const populatedLead = await Lead.findById(lead._id)
            .populate('assignedTo', 'fullName email avatar');

        // Create activity log
        await Activity.create({
            type: 'note',
            title: 'Lead Created',
            description: `Lead "${lead.name}" was created`,
            relatedTo: lead._id,
            relatedModel: 'Lead',
            assignedTo: req.user._id,
            createdBy: req.user._id,
            completed: true,
            completedAt: new Date()
        });

        res.status(201).json({ 
            success: true, 
            data: populatedLead,
            message: 'Lead created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update lead
router.put('/leads/:id', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to update leads' 
            });
        }

        let lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ 
                success: false, 
                message: 'Lead not found' 
            });
        }

        // Check authorization
        const role = req.user.role?.toUpperCase();
        if (!['ADMIN', 'MANAGER', 'HR'].includes(role) && 
            lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this lead' 
            });
        }

        // Track status change
        const oldStatus = lead.status;
        const newStatus = req.body.status;

        lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'fullName email avatar');

        // Log status change
        if (oldStatus !== newStatus) {
            await Activity.create({
                type: 'note',
                title: 'Status Changed',
                description: `Lead status changed from "${oldStatus}" to "${newStatus}"`,
                relatedTo: lead._id,
                relatedModel: 'Lead',
                assignedTo: req.user._id,
                createdBy: req.user._id,
                completed: true,
                completedAt: new Date()
            });
        }

        res.json({ 
            success: true, 
            data: lead,
            message: 'Lead updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete lead
router.delete('/leads/:id', protect, async (req, res) => {
    try {
        if (!canDelete(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to delete leads' 
            });
        }

        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ 
                success: false, 
                message: 'Lead not found' 
            });
        }

        // Delete related activities
        await Activity.deleteMany({ relatedTo: lead._id, relatedModel: 'Lead' });
        
        await Lead.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Lead deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Convert lead to contact + deal
router.post('/leads/:id/convert', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to convert leads' 
            });
        }

        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ 
                success: false, 
                message: 'Lead not found' 
            });
        }

        const { createDeal, dealTitle, dealValue, dealStage } = req.body;

        // Create contact from lead
        const nameParts = lead.name.split(' ');
        const contact = await CRMContact.create({
            firstName: nameParts[0] || lead.name,
            lastName: nameParts.slice(1).join(' ') || '',
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            position: lead.position,
            assignedTo: lead.assignedTo,
            leadSource: lead.source,
            notes: lead.notes
        });

        let deal = null;
        if (createDeal) {
            deal = await Deal.create({
                title: dealTitle || `Deal from ${lead.name}`,
                value: dealValue || lead.estimatedValue || 0,
                stage: dealStage || 'prospecting',
                owner: lead.assignedTo,
                contact: contact._id,
                lead: lead._id
            });
        }

        // Update lead status
        lead.status = 'converted';
        lead.convertedToContactId = contact._id;
        if (deal) lead.convertedToDealId = deal._id;
        await lead.save();

        // Log conversion
        await Activity.create({
            type: 'note',
            title: 'Lead Converted',
            description: `Lead converted to contact${deal ? ' and deal' : ''}`,
            relatedTo: lead._id,
            relatedModel: 'Lead',
            assignedTo: req.user._id,
            createdBy: req.user._id,
            completed: true,
            completedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Lead converted successfully',
            data: { contact, deal, lead }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bulk update leads
router.put('/leads/bulk/update', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to update leads' 
            });
        }

        const { ids, updates } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide lead IDs'
            });
        }

        const result = await Lead.updateMany(
            { _id: { $in: ids } },
            { ...updates, updatedAt: Date.now() }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} leads updated`,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DEAL ROUTES
// ============================================

// Get all deals
router.get('/deals', protect, async (req, res) => {
    try {
        const { 
            stage, 
            search, 
            page = 1, 
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minValue,
            maxValue
        } = req.query;
        
        let query = await buildRoleQuery(req.user, 'owner');
        
        if (stage && stage !== 'all') {
            query.stage = stage;
        }

        if (minValue || maxValue) {
            query.value = {};
            if (minValue) query.value.$gte = parseFloat(minValue);
            if (maxValue) query.value.$lte = parseFloat(maxValue);
        }
        
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await Deal.countDocuments(query);
        const deals = await Deal.find(query)
            .populate('owner', 'fullName email avatar')
            .populate('contact', 'firstName lastName email company')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                deals,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single deal
router.get('/deals/:id', protect, async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id)
            .populate('owner', 'fullName email avatar')
            .populate('contact', 'firstName lastName email phone company')
            .populate('lead', 'name email');
        
        if (!deal) {
            return res.status(404).json({ 
                success: false, 
                message: 'Deal not found' 
            });
        }

        const role = req.user.role?.toUpperCase();
        if (!['ADMIN', 'MANAGER', 'HR'].includes(role) && 
            deal.owner._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to view this deal' 
            });
        }

        const activities = await Activity.find({ 
            relatedTo: deal._id, 
            relatedModel: 'Deal' 
        })
        .sort({ createdAt: -1 })
        .limit(10);

        res.json({ 
            success: true, 
            data: { deal, activities } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create deal
router.post('/deals', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to create deals' 
            });
        }

        const dealData = {
            ...req.body,
            owner: req.body.owner || req.user._id
        };

        const deal = await Deal.create(dealData);
        const populatedDeal = await Deal.findById(deal._id)
            .populate('owner', 'fullName email avatar')
            .populate('contact', 'firstName lastName email');

        await Activity.create({
            type: 'note',
            title: 'Deal Created',
            description: `Deal "${deal.title}" worth $${deal.value} was created`,
            relatedTo: deal._id,
            relatedModel: 'Deal',
            assignedTo: req.user._id,
            createdBy: req.user._id,
            completed: true,
            completedAt: new Date()
        });

        res.status(201).json({ 
            success: true, 
            data: populatedDeal,
            message: 'Deal created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update deal
router.put('/deals/:id', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to update deals' 
            });
        }

        let deal = await Deal.findById(req.params.id);
        
        if (!deal) {
            return res.status(404).json({ 
                success: false, 
                message: 'Deal not found' 
            });
        }

        const role = req.user.role?.toUpperCase();
        if (!['ADMIN', 'MANAGER', 'HR'].includes(role) && 
            deal.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this deal' 
            });
        }

        const oldStage = deal.stage;
        const newStage = req.body.stage;

        deal = await Deal.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('owner', 'fullName email avatar')
         .populate('contact', 'firstName lastName email');

        if (oldStage !== newStage) {
            await Activity.create({
                type: 'note',
                title: 'Stage Changed',
                description: `Deal stage changed from "${oldStage}" to "${newStage}"`,
                relatedTo: deal._id,
                relatedModel: 'Deal',
                assignedTo: req.user._id,
                createdBy: req.user._id,
                completed: true,
                completedAt: new Date()
            });

            // Emit real-time notification if deal won/lost
            if (newStage === 'closed_won' || newStage === 'closed_lost') {
                const io = req.app.get('io');
                if (io) {
                    io.to(deal.owner._id.toString()).emit('dealStatusChange', {
                        dealId: deal._id,
                        title: deal.title,
                        stage: newStage,
                        value: deal.value
                    });
                }
            }
        }

        res.json({ 
            success: true, 
            data: deal,
            message: 'Deal updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete deal
router.delete('/deals/:id', protect, async (req, res) => {
    try {
        if (!canDelete(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to delete deals' 
            });
        }

        const deal = await Deal.findById(req.params.id);
        
        if (!deal) {
            return res.status(404).json({ 
                success: false, 
                message: 'Deal not found' 
            });
        }

        await Activity.deleteMany({ relatedTo: deal._id, relatedModel: 'Deal' });
        await Deal.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Deal deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get deal pipeline summary
router.get('/deals/pipeline/summary', protect, async (req, res) => {
    try {
        let query = await buildRoleQuery(req.user, 'owner');

        const pipeline = await Deal.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$value' },
                    avgProbability: { $avg: '$probability' }
                }
            },
            {
                $project: {
                    stage: '$_id',
                    count: 1,
                    totalValue: 1,
                    avgProbability: { $round: ['$avgProbability', 1] },
                    weightedValue: { 
                        $round: [{ $multiply: ['$totalValue', { $divide: ['$avgProbability', 100] }] }, 2] 
                    }
                }
            },
            { $sort: { stage: 1 } }
        ]);

        const stageOrder = ['prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
        const sortedPipeline = stageOrder.map(stage => 
            pipeline.find(p => p.stage === stage) || { 
                stage, 
                count: 0, 
                totalValue: 0, 
                avgProbability: 0, 
                weightedValue: 0 
            }
        );

        res.json({
            success: true,
            data: sortedPipeline
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// CONTACT ROUTES
// ============================================

// Get all contacts
router.get('/contacts', protect, async (req, res) => {
    try {
        const { 
            search, 
            company,
            page = 1, 
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        let query = await buildRoleQuery(req.user);
        
        if (company) {
            query.company = { $regex: company, $options: 'i' };
        }
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await CRMContact.countDocuments(query);
        const contacts = await CRMContact.find(query)
            .populate('assignedTo', 'fullName email avatar')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single contact
router.get('/contacts/:id', protect, async (req, res) => {
    try {
        const contact = await CRMContact.findById(req.params.id)
            .populate('assignedTo', 'fullName email avatar')
            .populate('accountId', 'name');
        
        if (!contact) {
            return res.status(404).json({ 
                success: false, 
                message: 'Contact not found' 
            });
        }

        // Get related deals
        const deals = await Deal.find({ contact: contact._id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get related activities
        const activities = await Activity.find({ 
            relatedTo: contact._id, 
            relatedModel: 'CRMContact' 
        })
        .sort({ createdAt: -1 })
        .limit(10);

        res.json({ 
            success: true, 
            data: { contact, deals, activities } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create contact
router.post('/contacts', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to create contacts' 
            });
        }

        const contactData = {
            ...req.body,
            assignedTo: req.body.assignedTo || req.user._id
        };

        const contact = await CRMContact.create(contactData);
        const populatedContact = await CRMContact.findById(contact._id)
            .populate('assignedTo', 'fullName email avatar');

        res.status(201).json({ 
            success: true, 
            data: populatedContact,
            message: 'Contact created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update contact
router.put('/contacts/:id', protect, async (req, res) => {
    try {
        if (!canWrite(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to update contacts' 
            });
        }

        let contact = await CRMContact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ 
                success: false, 
                message: 'Contact not found' 
            });
        }

        contact = await CRMContact.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'fullName email avatar');

        res.json({ 
            success: true, 
            data: contact,
            message: 'Contact updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete contact
router.delete('/contacts/:id', protect, async (req, res) => {
    try {
        if (!canDelete(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to delete contacts' 
            });
        }

        const contact = await CRMContact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ 
                success: false, 
                message: 'Contact not found' 
            });
        }

        await Activity.deleteMany({ relatedTo: contact._id, relatedModel: 'CRMContact' });
        await CRMContact.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Contact deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ACTIVITY ROUTES
// ============================================

// Get all activities
router.get('/activities', protect, async (req, res) => {
    try {
        const { 
            type, 
            completed,
            page = 1, 
            limit = 20,
            sortBy = 'dueDate',
            sortOrder = 'asc'
        } = req.query;
        
        let query = { assignedTo: req.user._id };
        
        if (type && type !== 'all') {
            query.type = type;
        }

        if (completed !== undefined) {
            query.completed = completed === 'true';
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await Activity.countDocuments(query);
        const activities = await Activity.find(query)
            .populate('relatedTo')
            .populate('assignedTo', 'fullName')
            .populate('createdBy', 'fullName')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create activity
router.post('/activities', protect, async (req, res) => {
    try {
        const activityData = {
            ...req.body,
            assignedTo: req.body.assignedTo || req.user._id,
            createdBy: req.user._id
        };

        const activity = await Activity.create(activityData);
        const populatedActivity = await Activity.findById(activity._id)
            .populate('relatedTo')
            .populate('assignedTo', 'fullName');

        res.status(201).json({ 
            success: true, 
            data: populatedActivity,
            message: 'Activity created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update activity
router.put('/activities/:id', protect, async (req, res) => {
    try {
        let activity = await Activity.findById(req.params.id);
        
        if (!activity) {
            return res.status(404).json({ 
                success: false, 
                message: 'Activity not found' 
            });
        }

        // If completing activity, set completedAt
        if (req.body.completed && !activity.completed) {
            req.body.completedAt = new Date();
        }

        activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('relatedTo')
         .populate('assignedTo', 'fullName');

        res.json({ 
            success: true, 
            data: activity,
            message: 'Activity updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete activity
router.delete('/activities/:id', protect, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        
        if (!activity) {
            return res.status(404).json({ 
                success: false, 
                message: 'Activity not found' 
            });
        }

        await Activity.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Activity deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark activity as complete
router.patch('/activities/:id/complete', protect, async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { 
                completed: true, 
                completedAt: new Date(),
                outcome: req.body.outcome 
            },
            { new: true }
        ).populate('relatedTo');

        if (!activity) {
            return res.status(404).json({ 
                success: false, 
                message: 'Activity not found' 
            });
        }

        res.json({ 
            success: true, 
            data: activity,
            message: 'Activity marked as complete'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// REPORTS & ANALYTICS
// ============================================

// Sales performance report
router.get('/reports/sales-performance', protect, async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'month' } = req.query;
        
        const dateMatch = {};
        if (startDate) dateMatch.$gte = new Date(startDate);
        if (endDate) dateMatch.$lte = new Date(endDate);

        let query = await buildRoleQuery(req.user, 'owner');
        if (Object.keys(dateMatch).length > 0) {
            query.createdAt = dateMatch;
        }

        const groupByFormat = groupBy === 'day' 
            ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            : groupBy === 'week'
            ? { $week: '$createdAt' }
            : { $dateToString: { format: '%Y-%m', date: '$createdAt' } };

        const salesData = await Deal.aggregate([
            { $match: { ...query, stage: 'closed_won' } },
            {
                $group: {
                    _id: groupByFormat,
                    totalDeals: { $sum: 1 },
                    totalValue: { $sum: '$value' },
                    avgDealSize: { $avg: '$value' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const leadsData = await Lead.aggregate([
            { $match: await buildRoleQuery(req.user) },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                salesTrend: salesData,
                leadsByStatus: leadsData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Team leaderboard
router.get('/reports/leaderboard', protect, async (req, res) => {
    try {
        const role = req.user.role?.toUpperCase();
        
        if (!['ADMIN', 'MANAGER', 'HR'].includes(role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view leaderboard'
            });
        }

        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const leaderboard = await Deal.aggregate([
            { 
                $match: { 
                    stage: 'closed_won',
                    actualCloseDate: { $gte: currentMonth }
                } 
            },
            {
                $group: {
                    _id: '$owner',
                    totalDeals: { $sum: 1 },
                    totalValue: { $sum: '$value' }
                }
            },
            { $sort: { totalValue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    name: '$user.fullName',
                    avatar: '$user.avatar',
                    totalDeals: 1,
                    totalValue: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// USERS FOR ASSIGNMENT
// ============================================
router.get('/users/assignable', protect, async (req, res) => {
    try {
        const users = await User.find({ 
            isActive: { $ne: false },
            role: { $in: ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'SALES'] }
        }).select('_id fullName email avatar role');

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;