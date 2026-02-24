const { admin, db } = require("../config/firebase");

/**
 * Verifies Firebase ID Token from Authorization header
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing or malformed token" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("[AUTH] Token verification failed:", error.message);
        res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};

/**
 * Checks if user is banned or scheduled for deletion
 * Injects userProfile into request object
 */
const checkUserStatus = async (req, res, next) => {
    if (!db || !req.user) return next();

    try {
        const snapshot = await db.ref(`attendanceRecords/profiles/${req.user.uid}`).once("value");
        const profile = snapshot.val();

        if (profile?.banned) {
            return res.status(403).json({ error: "Access Denied: Your account has been restricted." });
        }

        if (profile?.deleted) {
            return res.status(403).json({ error: "Access Denied: Account is marked for deletion." });
        }

        // Default profile if not exists yet
        req.userProfile = profile || {
            role: "student",
            orgId: req.user.email?.split('@')[1] || "default"
        };

        next();
    } catch (error) {
        console.error("[AUTH] Status check failed:", error.message);
        res.status(500).json({ error: "Internal Server Error: Could not verify user status" });
    }
};

/**
 * Middleware factory for role-based access control
 */
const roleGuard = (allowedRoles) => (req, res, next) => {
    if (!req.userProfile) {
        return res.status(500).json({ error: "Server Error: Missing user profile context" });
    }

    if (allowedRoles.includes(req.userProfile.role)) {
        next();
    } else {
        res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
};

module.exports = {
    verifyToken,
    checkUserStatus,
    roleGuard
};
