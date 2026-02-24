const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, checkUserStatus } = require("../middleware/auth.middleware");

// GDPR Endpoints
router.get("/export-data", verifyToken, checkUserStatus, userController.exportUserData);
router.post("/request-deletion", verifyToken, checkUserStatus, userController.requestDeletion);

module.exports = router;
