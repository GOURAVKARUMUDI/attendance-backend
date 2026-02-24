const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken, checkUserStatus } = require("../middleware/auth.middleware");

// Public SSO lookup
router.get("/sso-config/:domain", authController.getSSOConfig);

// Protected login event logging
router.post("/login-event", verifyToken, checkUserStatus, authController.logLoginEvent);

module.exports = router;
