const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

//cors
app.use(cors(
    {
        credentials: true,
        origin: "http://localhost:5173"
    }
));

//auth routes
const authRoute = require("./routes/auth.route");

//food routes
const foodRoute = require("./routes/foods.route");

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/food", foodRoute);

module.exports = app;