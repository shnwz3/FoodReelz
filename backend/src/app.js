const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

//cors
//cors
let rawOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
// Robust sanitization: remove all trailing slashes and trim whitespace
let allowedOrigin = rawOrigin.replace(/\/+$/, "").trim();

console.log("CORS Check:");
console.log("- Raw Env Var (FRONTEND_URL):", `'${rawOrigin}'`);
console.log("- Sanitized Allowed Origin:", `'${allowedOrigin}'`);

app.use(cors(
    {
        credentials: true,
        origin: allowedOrigin
    }
));

// Health check route
app.get("/", (req, res) => {
    res.status(200).send("FoodReelz Backend is live and running!");
});

//auth routes
const authRoute = require("./routes/auth.route");

//food routes
const foodRoute = require("./routes/foods.route");

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/food", foodRoute);

module.exports = app;