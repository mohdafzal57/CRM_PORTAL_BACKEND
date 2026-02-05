// controllers/adminController.js
// NEW CONTROLLER - Handles all admin dashboard operations
// Integrates with existing User, Company models and auth middleware

const User = require('../models/User'); // Existing model
const Company = require('../models/Company'); // Existing model
const Attendance = require('../models/Attendance'); // New model
const WorkReport = require('../models/WorkReport'); // New model
const { generateExcel, generatePDF } = require('../utils/exportUtils');

// ==================== DASHBOARD ====================

// GET /api/admin/dashboard - Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for performance
    const [
      totalEmployees,
      totalInterns,
      activeUsers,
      disabledUsers,
      todayAttendance,
      pendingReports,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['EMPLOYEE', 'HR', 'MANAGER'] }, companyId: req.user.companyId._id || req.user.companyId }),
      User.countDocuments({ role: 'INTERN', companyId: req.user.companyId._id || req.user.companyId }),
      User.countDocuments({ isActive: true, role: { $ne: 'ADMIN' }, companyId: req.user.companyId._id || req.user.companyId }),
      User.countDocuments({ isActive: false, role: { $ne: 'ADMIN' }, companyId: req.user.companyId._id || req.user.companyId }),
      Attendance.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      WorkReport.countDocuments({ status: 'SUBMITTED' }),
      User.find({ role: { $ne: 'ADMIN' }, companyId: req.user.companyId._id || req.user.companyId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName email role createdAt isActive')
    ]);

    // Format attendance summary
    const attendanceSummary = {
      present: 0, absent: 0, late: 0, onLeave: 0
    };
    todayAttendance.forEach(item => {
      const key = item._id.toLowerCase().replace('_', '');
      if (attendanceSummary.hasOwnProperty(key)) {
        attendanceSummary[key] = item.count;
      }
    });

    res.json({
      success: true,
      data: {
        counts: {
          totalEmployees,
          totalInterns,
          activeUsers,
          disabledUsers,
          totalUsers: totalEmployees + totalInterns
        },
        todayAttendance: attendanceSummary,
        pendingReports,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

// GET /api/admin/users - List all users with filters
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      role: { $ne: 'ADMIN' },
      companyId: req.user.companyId // Filter by admin's company
    };

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'disabled') query.isActive = false;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
};

// POST /api/admin/users - Create new user (Admin-created only)
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, mobile, department, designation } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Generate employee ID
    const count = await User.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(5, '0')}`;

    const user = new User({
      fullName,
      email,
      password, // Will be hashed by existing User model pre-save hook
      role: role || 'EMPLOYEE',
      companyId: req.user.companyId._id || req.user.companyId, // Assign admin's company
      mobile,
      department,
      designation,
      employeeId,
      isActive: true,
      createdBy: req.user._id // From existing auth middleware
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { ...user.toObject(), password: undefined }
    });
  } catch (error) {
    console.error('Create user error:', error);
    next(error);
  }
};

// PUT /api/admin/users/:id - Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent role escalation to ADMIN
    if (updates.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot assign ADMIN role' });
    }

    // Remove sensitive fields
    delete updates.password;
    delete updates._id;

    const user = await User.findOneAndUpdate(
      { _id: id, companyId: req.user.companyId._id || req.user.companyId },
      { ...updates, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
};

// PATCH /api/admin/users/:id/toggle-status - Enable/Disable user
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
};

// DELETE /api/admin/users/:id - Permanent delete
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the user being deleted belongs to the same company
    const user = await User.findOne({ _id: id, companyId: req.user.companyId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or access denied' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin account' });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// ==================== ATTENDANCE MANAGEMENT ====================

// GET /api/admin/attendance - Get attendance records with filters
exports.getAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      startDate,
      endDate,
      status,
      outOfOffice
    } = req.query;

    const query = {};

    if (userId) query.user = userId;
    if (status) query.status = status;
    if (outOfOffice === 'true') {
      query['checkIn.isWithinOffice'] = false;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('user', 'name email employeeId department role')
        .sort({ date: -1, 'checkIn.time': -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

// GET /api/admin/attendance/summary - Monthly attendance summary
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { month, year, userId } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const matchQuery = {
      date: { $gte: startDate, $lte: endDate }
    };
    if (userId) matchQuery.user = require('mongoose').Types.ObjectId(userId);

    const summary = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$user',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
          leaveDays: { $sum: { $cond: [{ $eq: ['$status', 'ON_LEAVE'] }, 1, 0] } },
          totalWorkHours: { $sum: '$workHours' },
          avgWorkHours: { $avg: '$workHours' },
          outOfOfficeCheckins: {
            $sum: { $cond: [{ $eq: ['$checkIn.isWithinOffice', false] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          user: {
            _id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email',
            employeeId: '$userDetails.employeeId',
            department: '$userDetails.department'
          },
          totalDays: 1,
          presentDays: 1,
          lateDays: 1,
          absentDays: 1,
          leaveDays: 1,
          totalWorkHours: 1,
          avgWorkHours: { $round: ['$avgWorkHours', 2] },
          outOfOfficeCheckins: 1,
          attendancePercentage: {
            $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] }, 2]
          }
        }
      },
      { $sort: { 'user.name': 1 } }
    ]);

    res.json({ success: true, data: summary, period: { month, year } });
  } catch (error) {
    console.error('Attendance summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};

// GET /api/admin/attendance/geo-logs - Geo-location attendance logs
exports.getGeoLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, date, outOfOfficeOnly } = req.query;

    const query = {
      $or: [
        { 'checkIn.location.latitude': { $exists: true } },
        { 'checkOut.location.latitude': { $exists: true } }
      ]
    };

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    }

    if (outOfOfficeOnly === 'true') {
      query.$and = [
        {
          $or: [
            { 'checkIn.isWithinOffice': false },
            { 'checkOut.isWithinOffice': false }
          ]
        }
      ];
    }

    const [logs, total, company] = await Promise.all([
      Attendance.find(query)
        .populate('user', 'name email employeeId department')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query),
      Company.findOne().select('officeLocation')
    ]);

    res.json({
      success: true,
      data: logs,
      officeLocation: company?.officeLocation,
      pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    console.error('Geo logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch geo logs' });
  }
};

// POST /api/admin/attendance/manual - Manual attendance entry
exports.createManualAttendance = async (req, res) => {
  try {
    const { userId, date, checkInTime, checkOutTime, status, notes } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check for existing record
    const existing = await Attendance.findOne({ user: userId, date: attendanceDate });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already exists for this date' });
    }

    const attendance = new Attendance({
      user: userId,
      date: attendanceDate,
      checkIn: checkInTime ? { time: new Date(checkInTime), isWithinOffice: true } : undefined,
      checkOut: checkOutTime ? { time: new Date(checkOutTime), isWithinOffice: true } : undefined,
      status,
      notes,
      isManualEntry: true,
      approvedBy: req.user._id
    });

    await attendance.save();

    res.status(201).json({ success: true, message: 'Attendance recorded successfully', data: attendance });
  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to create attendance' });
  }
};

// ==================== WORK REPORTS ====================

// GET /api/admin/reports - Get work reports
exports.getWorkReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, status, startDate, endDate } = req.query;

    const query = {};
    if (userId) query.user = userId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [reports, total] = await Promise.all([
      WorkReport.find(query)
        .populate('user', 'name email employeeId department role')
        .populate('adminReview.reviewedBy', 'name')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      WorkReport.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// PUT /api/admin/reports/:id/review - Review work report
exports.reviewWorkReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, rating } = req.body;

    const report = await WorkReport.findByIdAndUpdate(
      id,
      {
        status,
        adminReview: {
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          notes,
          rating
        }
      },
      { new: true }
    ).populate('user', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report reviewed successfully', data: report });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({ success: false, message: 'Failed to review report' });
  }
};

// ==================== EXPORT ====================

// POST /api/admin/export - Export data
exports.exportData = async (req, res) => {
  try {
    const { type, format, filters } = req.body;
    let data, filename, columns;

    switch (type) {
      case 'users':
        data = await User.find({ role: { $ne: 'ADMIN' }, ...filters }).select('-password').lean();
        columns = ['employeeId', 'name', 'email', 'role', 'department', 'designation', 'phone', 'isActive'];
        filename = `employees_${Date.now()}`;
        break;

      case 'attendance':
        data = await Attendance.find(filters)
          .populate('user', 'name employeeId department')
          .lean();
        data = data.map(r => ({
          employeeId: r.user?.employeeId,
          name: r.user?.name,
          department: r.user?.department,
          date: r.date?.toISOString().split('T')[0],
          checkIn: r.checkIn?.time?.toISOString(),
          checkOut: r.checkOut?.time?.toISOString(),
          status: r.status,
          workHours: r.workHours,
          isWithinOffice: r.checkIn?.isWithinOffice ? 'Yes' : 'No'
        }));
        columns = ['employeeId', 'name', 'department', 'date', 'checkIn', 'checkOut', 'status', 'workHours', 'isWithinOffice'];
        filename = `attendance_${Date.now()}`;
        break;

      case 'reports':
        data = await WorkReport.find(filters)
          .populate('user', 'name employeeId department')
          .lean();
        data = data.map(r => ({
          employeeId: r.user?.employeeId,
          name: r.user?.name,
          date: r.date?.toISOString().split('T')[0],
          totalHours: r.totalHoursWorked,
          tasksCount: r.tasks?.length || 0,
          status: r.status,
          summary: r.summary?.substring(0, 200)
        }));
        columns = ['employeeId', 'name', 'date', 'totalHours', 'tasksCount', 'status', 'summary'];
        filename = `work_reports_${Date.now()}`;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid export type' });
    }

    let buffer, contentType;
    if (format === 'excel') {
      buffer = await generateExcel(data, columns, type);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename += '.xlsx';
    } else {
      buffer = await generatePDF(data, columns, type);
      contentType = 'application/pdf';
      filename += '.pdf';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
};

// ==================== SETTINGS ====================

// GET /api/admin/settings - Get company settings
exports.getSettings = async (req, res) => {
  try {
    // Uses existing Company model
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        name: 'My Company',
        officeLocation: { latitude: 0, longitude: 0, address: '', radius: 0.1 },
        workingHours: { start: '09:00', end: '18:00' },
        timezone: 'UTC',
        policies: {}
      });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// PUT /api/admin/settings - Update company settings
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    const company = await Company.findOneAndUpdate(
      {},
      { ...updates, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, message: 'Settings updated successfully', data: company });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};