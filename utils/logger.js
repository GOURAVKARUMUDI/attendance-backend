const { admin, db } = require("../config/firebase");

/**
 * Universal Action Logger for security and auditing
 */
const logAction = async ({ action, performedBy, targetUser = null, role, orgId = null }) => {
    if (!db) return;
    try {
        await db.ref("auditLogs").push({
            action,
            performedBy,
            targetUser,
            role,
            orgId,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });
    } catch (e) {
        console.error("[AUDIT] Log failure:", e.message);
    }
};

module.exports = { logAction };
