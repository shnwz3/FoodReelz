const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGODB_CONNECT_URI;
    if (!uri) {
        console.error("MONGODB_CONNECT_URI is not defined in environment variables");
        process.exit(1);
    }

    try {
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error event:', err);
        });

        // We use the URI directly. 
        // TIP: Ensure your URI on Render includes the database name (e.g. ...mongodb.net/foodView?...)
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        if (error.message.includes("ECONNREFUSED") || error.message.includes("querySrv")) {
            console.error("CRITICAL: MongoDB Connection Refused.");
            console.error("TIP: Ensure your current IP is whitelisted in MongoDB Atlas (Network Access).");
            console.error("Check your MONGODB_CONNECT_URI in .env.");
        } else {
            console.error("MongoDB connection error:", error.message);
        }

        // On Render, we want the process to exit so it can restart properly
        process.exit(1);
    }
}

module.exports = connectDB;
