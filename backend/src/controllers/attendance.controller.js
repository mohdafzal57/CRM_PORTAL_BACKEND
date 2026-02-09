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
