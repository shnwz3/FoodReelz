const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");

//cors
let rawOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
// Robust sanitization: remove all trailing slashes and trim whitespace
let allowedOrigin = rawOrigin.replace(/\/+$/, "").trim();

console.log("CORS Check:");
console.log("- Raw Env Var (FRONTEND_URL):", `'${rawOrigin}'`);
console.log("- Sanitized Allowed Origin:", `'${allowedOrigin}'`);

// Core Middlewares
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(morgan("dev")); // Request logging
app.use(cors(
    {
        credentials: true,
        origin: allowedOrigin
    }
));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api/", limiter);

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "FoodReelz Backend is live and running!",
        system: {
            security: "helmet-enabled",
            compression: "gzip-enabled",
            cors_origin: allowedOrigin
        }
    });
});

//auth routes
const authRoute = require("./routes/auth.route");

//food routes
const foodRoute = require("./routes/foods.route");

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/food", foodRoute);

// 404 Not Found Handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Global Error] ${req.method} ${req.originalUrl}:`, err.message);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;