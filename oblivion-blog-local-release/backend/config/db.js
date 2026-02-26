const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * @param {string} [uri] - Optional URI to connect to. Falls back to process.env.MONGO_URI.
 */
const connectDB = async (uri) => {
    const target = uri || process.env.MONGO_URI;
    if (!target) {
        console.warn('MongoDB URI not set, skipping DB connection (awaiting install).');
        return;
    }

    // If already connected with an active connection, skip
    if (mongoose.connection.readyState === 1) {
        return;
    }

    try {
        const conn = await mongoose.connect(target);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
