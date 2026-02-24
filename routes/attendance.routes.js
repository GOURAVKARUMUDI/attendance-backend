const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");
const { verifyToken, checkUserStatus } = require("../middleware/auth.middleware");

// Attendance tracking
router.post("/save", verifyToken, checkUserStatus, attendanceController.saveAttendance);
router.get("/my-records", verifyToken, checkUserStatus, attendanceController.getUserRecords);

module.exports = router;
