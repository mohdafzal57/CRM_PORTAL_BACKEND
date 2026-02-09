router.get(
    "/my-history",
    authMiddleware,
    roleMiddleware(["employee", "intern"]),
    attendanceController.getMyAttendanceHistory
  );
  