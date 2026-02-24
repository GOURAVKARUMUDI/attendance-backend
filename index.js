const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// Load Environment
dotenv.config();

// Import Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

/**
 * PRODUCTION SECURITY & PERFORMANCE MIDDLEWARE
 */
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: true, credentials: true }));

/**
 * RATE LIMITING
 * Prevents brute-force and DoS attacks
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});
app.use("/api/", limiter);

/**
 * OBSERVABILITY MIDDLEWARE
 * Logs slow requests in production
 */
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 500) {
            console.warn(`[PERF] Slow Request: ${req.method} ${req.originalUrl} - ${duration}ms`);
        }
    });
    next();
});

/**
 * API ROUTES
 */
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

/**
 * CENTRALIZED ERROR HANDLING
 * Catches all unhandled errors and returns standardized JSON
 */
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.stack);

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: statusCode === 500 ? "Internal Server Error" : err.message,
        path: req.originalUrl
    });
});

/**
 * SERVER LIFECYCLE
 */
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`[SERVER] SaaS Core Production Live on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
    server.close(() => console.log('[SERVER] Process terminated.'));
});

module.exports = app;
