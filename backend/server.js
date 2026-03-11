require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

const startServer = async () => {
    await connectDB();

    const server = app.listen(process.env.PORT, () => {
        console.log(`server started on port ${process.env.PORT}`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
        console.log(`\nReceived ${signal}. Shutting down gracefully...`);
        server.close(async () => {
            console.log('HTTP server closed.');
            const mongoose = require("mongoose");
            if (mongoose.connection.readyState === 1) {
                await mongoose.connection.close(false);
                console.log('MongoDB connection closed.');
            }
            process.exit(0);
        });
        
        // Force shutdown after 10s if graceful fails
        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startServer();
