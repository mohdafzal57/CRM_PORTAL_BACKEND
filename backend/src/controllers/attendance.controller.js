// backend/src/controllers/attendance.controller.js

const Attendance = require("../models/Attendance");
const User = require("../models/User");

exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, address, deviceInfo } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Normalize date (today only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check duplicate attendance
    const alreadyMarked = await Attendance.findOne({
      user: userId,
      date: today
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked for today"
      });
    }

    // Fetch user & company location
    const user = await User.findById(userId).populate("company");
    const office = user.company?.officeLocation;

    let isWithinOffice = false;
    if (office?.latitude && office?.longitude) {
      isWithinOffice = Attendance.isWithinOfficeRadius(
        latitude,
        longitude,
        office.latitude,
        office.longitude
      );
    }

    const attendance = new Attendance({
      user: userId,
      date: today,
      checkIn: {
        time: new Date(),
        location: {
          latitude,
          longitude,
          address
        },
        isWithinOffice,
        deviceInfo
      },
      status: isWithinOffice ? "PRESENT" : "LATE"
    });

    await attendance.save();

    res.status(201).json({
      message: "Check-in successful",
      status: attendance.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.checkOut = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const attendance = await Attendance.findOne({
        user: userId,
        date: today
      });
  
      if (!attendance || !attendance.checkIn?.time) {
        return res.status(400).json({
          message: "Check-in not found for today"
        });
      }
  
      if (attendance.checkOut?.time) {
        return res.status(400).json({
          message: "Check-out already marked"
        });
      }
  
      attendance.checkOut = {
        time: new Date()
      };
  
      await attendance.save();
  
      res.json({
        message: "Check-out successful",
        workHours: attendance.formattedWorkHours
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  router.post(
    "/check-out",
    authMiddleware,
    roleMiddleware(["employee", "intern"]),
    attendanceController.checkOut
  );
  exports.getMyAttendanceHistory = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "10", 10);
      const skip = (page - 1) * limit;
  
      // last 30 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      fromDate.setHours(0, 0, 0, 0);
  
      const [data, total] = await Promise.all([
        Attendance.find({
          user: userId,
          date: { $gte: fromDate }
        })
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .select("date checkIn checkOut status workHours overtimeHours"),
        Attendance.countDocuments({
          user: userId,
          date: { $gte: fromDate }
        })
      ]);
  
      res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
     