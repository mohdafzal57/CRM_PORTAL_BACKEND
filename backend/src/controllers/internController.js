/**
 * Intern Controller
 * Handles operations specific to interns
 */

const Intern = require('../models/Intern');
const User = require('../models/User');

/**
 * @desc    Get current intern profile
 * @route   GET /api/intern/profile
 * @access  Private (Intern only)
 */
exports.getInternProfile = async (req, res, next) => {
    try {
        const intern = await Intern.findOne({ userId: req.user.id })
            .populate('userId', 'fullName email mobile department designation profilePicture');

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: 'Intern profile not found'
            });
        }

        res.json({
            success: true,
            data: intern
        });
    } catch (error) {
        console.error('Get Intern Profile Error:', error);
        next(error);
    }
};

/**
 * @desc    Update intern profile
 * @route   PUT /api/intern/profile
 * @access  Private (Intern only)
 */
exports.updateInternProfile = async (req, res, next) => {
    try {
        const { personal, education } = req.body;

        // Interns can ONLY update Personal and Education details
        // Internship and Project Work are managed by Admin/HR

        const intern = await Intern.findOneAndUpdate(
            { userId: req.user.id },
            {
                $set: {
                    personal,
                    education
                }
            },
            { new: true, runValidators: true }
        );

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: 'Intern profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: intern
        });
    } catch (error) {
        console.error('Update Intern Profile Error:', error);
        next(error);
    }
};

/**
 * @desc    Submit daily task update
 * @route   POST /api/intern/tasks
 * @access  Private (Intern only)
 */
exports.submitDailyTask = async (req, res, next) => {
    try {
        const { task, status } = req.body;

        const intern = await Intern.findOne({ userId: req.user.id });

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: 'Intern profile not found'
            });
        }

        intern.academicWork.dailyTaskUpdate.push({
            task,
            status,
            date: new Date()
        });

        await intern.save();

        res.status(201).json({
            success: true,
            message: 'Task updated successfully',
            data: intern.academicWork.dailyTaskUpdate[intern.academicWork.dailyTaskUpdate.length - 1]
        });
    } catch (error) {
        console.error('Submit Task Error:', error);
        next(error);
    }
};

/**
 * @desc    Get task history
 * @route   GET /api/intern/tasks
 * @access  Private (Intern only)
 */
exports.getTaskHistory = async (req, res, next) => {
    try {
        const intern = await Intern.findOne({ userId: req.user.id })
            .select('academicWork.dailyTaskUpdate');

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: 'Intern profile not found'
            });
        }

        res.json({
            success: true,
            data: intern.academicWork.dailyTaskUpdate
        });
    } catch (error) {
        console.error('Get Task History Error:', error);
        next(error);
    }
};

/**
 * @desc    Submit weekly progress report
 * @route   POST /api/intern/reports
 * @access  Private (Intern only)
 */
exports.submitWeeklyReport = async (req, res, next) => {
    try {
        const { report, weekNumber } = req.body;

        const intern = await Intern.findOne({ userId: req.user.id });

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: 'Intern profile not found'
            });
        }

        intern.academicWork.weeklyProgressReport.push({
            weekNumber,
            report,
            submittedAt: new Date()
        });

        await intern.save();

        res.status(201).json({
            success: true,
            message: 'Weekly report submitted successfully',
            data: intern.academicWork.weeklyProgressReport[intern.academicWork.weeklyProgressReport.length - 1]
        });
    } catch (error) {
        console.error('Submit Weekly Report Error:', error);
        next(error);
    }
};
/**
 * @desc    Get assigned tasks
 * @route   GET /api/intern/assigned-tasks
 * @access  Private (Intern only)
 */
exports.getAssignedTasks = async (req, res, next) => {
    try {
        const intern = await Intern.findOne({ userId: req.user.id })
            .select('assignedTasks');

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: 'Intern profile not found'
            });
        }

        res.json({
            success: true,
            data: intern.assignedTasks
        });
    } catch (error) {
        console.error('Get Assigned Tasks Error:', error);
        next(error);
    }
};

/**
 * @desc    Update assigned task status
 * @route   PATCH /api/intern/assigned-tasks/:taskId
 * @access  Private (Intern only)
 */
exports.updateAssignedTaskStatus = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const intern = await Intern.findOne({ userId: req.user.id });

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: 'Intern profile not found'
            });
        }

        const task = intern.assignedTasks.id(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        task.status = status;
        await intern.save();

        res.json({
            success: true,
            message: 'Task status updated',
            data: task
        });
    } catch (error) {
        console.error('Update Task Status Error:', error);
        next(error);
    }
};
