const { db } = require("../config/firebase");

/**
 * Exports all data associated with a user (GDPR compliance)
 */
exports.exportUserData = async (req, res) => {
    const { uid } = req.user;
    const { orgId } = req.userProfile;

    if (!db) return res.status(503).json({ error: "Database disconnected" });

    try {
        const attendanceData = await db.ref(`attendanceRecords/${orgId}/data/${uid}`).once("value");
        const auditLogs = await db.ref("auditLogs").orderByChild("performedBy").equalTo(uid).once("value");

        res.json({
            success: true,
            data: {
                profile: req.userProfile,
                attendance: attendanceData.val() || {},
                audit: auditLogs.val() || {}
            }
        });
    } catch (error) {
        console.error("[USER] Export failed:", error.message);
        res.status(500).json({ error: "Failed to export user data" });
    }
};

/**
 * Registers a user's request for data deletion (GDPR compliance)
 */
exports.requestDeletion = async (req, res) => {
    const { uid } = req.user;
    const { orgId } = req.userProfile;

    if (!db) return res.status(503).json({ error: "Database disconnected" });

    try {
        await db.ref(`gdprDeletionRequests/${uid}`).set({
            uid,
            orgId,
            requestedAt: Date.now(),
            status: "pending"
        });
        res.json({ success: true });
    } catch (error) {
        console.error("[USER] Deletion request failed:", error.message);
        res.status(500).json({ error: "Failed to process deletion request" });
    }
};
