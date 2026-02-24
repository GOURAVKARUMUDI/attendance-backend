const { db } = require("../config/firebase");
const { logAction } = require("../utils/logger");

/**
 * Handles SSO configuration lookups by domain
 */
exports.getSSOConfig = async (req, res) => {
    const { domain } = req.params;
    if (!domain) return res.status(400).json({ error: "Domain required" });

    try {
        if (!db) return res.json({ ssoEnabled: false });

        const snap = await db.ref("organizations").orderByChild("sso/domain").equalTo(domain).once("value");

        if (!snap.exists()) {
            return res.json({ ssoEnabled: false });
        }

        const orgData = Object.values(snap.val())[0];
        res.json({
            ssoEnabled: true,
            provider: orgData.sso?.provider || "google",
            orgId: orgData.id
        });
    } catch (error) {
        console.error("[AUTH] SSO lookup failed:", error.message);
        res.status(500).json({ error: "Failed to retrieve SSO configuration" });
    }
};

/**
 * Logs a successful login event for audit purposes
 */
exports.logLoginEvent = async (req, res) => {
    const { uid } = req.user;
    const { orgId, role } = req.userProfile;

    try {
        await logAction({
            action: "LOGIN",
            performedBy: uid,
            role,
            orgId
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to log login event" });
    }
};
