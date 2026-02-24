const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, checkUserStatus, roleGuard } = require("../middleware/auth.middleware");

// Admin Dashboard & Analytics (Read-only for Admin, RW for Super-Admin)
router.get("/analytics", verifyToken, checkUserStatus, roleGuard(["admin", "super-admin"]), adminController.getAnalytics);
router.get("/records", verifyToken, checkUserStatus, roleGuard(["admin", "super-admin"]), adminController.getAllOrgRecords);

// Super-Admin Only Controls
router.get("/users", verifyToken, checkUserStatus, roleGuard(["super-admin"]), adminController.getAllOrgRecords); // Reuse logic for list
router.post("/update-role", verifyToken, checkUserStatus, roleGuard(["super-admin"]), adminController.updateUserRole);
router.post("/toggle-ban", verifyToken, checkUserStatus, roleGuard(["super-admin"]), adminController.toggleUserBan);
router.get("/backup", verifyToken, checkUserStatus, roleGuard(["super-admin"]), adminController.getBackup);

module.exports = router;
