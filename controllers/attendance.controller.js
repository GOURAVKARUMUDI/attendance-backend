const { admin, db } = require("../config/firebase");
const { logAction } = require("../utils/logger");

/**
 * Saves attendance records with strict orgId partitioning
 */
exports.saveAttendance = async (req, res) => {
    const { uid } = req.user;
    const { orgId, role } = req.userProfile;
    const { subjectName, percentage, calculationType, data } = req.body;

    if (!db) return res.status(503).json({ error: "Database disconnected" });
    if (!subjectName) return res.status(400).json({ error: "Subject name required" });

    try {
        const cleanSubject = subjectName.trim();
        await db.ref(`attendanceRecords/${orgId}/data/${uid}/${cleanSubject}`).push({
            percentage,
            calculationType,
            data,
            createdAt: admin.database.ServerValue.TIMESTAMP
        });

        await logAction({
            action: "SAVE_ATTENDANCE",
            performedBy: uid,
            orgId,
            role
        });

        res.json({ success: true, message: "Attendance record saved" });
    } catch (error) {
        console.error("[ATTENDANCE] Save failed:", error.message);
        res.status(500).json({ error: "Failed to save attendance record" });
    }
};

/**
 * Fetches user's own attendance records
 */
exports.getUserRecords = async (req, res) => {
    const { uid } = req.user;
    const { orgId } = req.userProfile;

    if (!db) return res.status(503).json({ error: "Database disconnected" });

    try {
        const snapshot = await db.ref(`attendanceRecords/${orgId}/data/${uid}`).once("value");
        res.json({ success: true, records: snapshot.val() || {} });
    } catch (error) {
        console.error("[ATTENDANCE] Fetch failed:", error.message);
        res.status(500).json({ error: "Failed to retrieve attendance records" });
    }
};
