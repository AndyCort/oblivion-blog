const mongoose = require('mongoose');

/**
 * Connect to MongoDB with auto-retry.
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

    const masked = target.replace(/:([^@]+)@/, ':****@');
    // Extract username and password for debugging
    const match = target.match(/\/\/([^:]+):([^@]+)@/);
    if (match) {
        console.log(`DB User: "${match[1]}", Password length: ${match[2].length}, Password starts with: "${match[2].substring(0, 3)}..."`);
    }
    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[Attempt ${attempt}/${MAX_RETRIES}] Connecting to MongoDB: ${masked}`);
            const conn = await mongoose.connect(target, {
                serverSelectionTimeoutMS: 10000,
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            return; // success
        } catch (error) {
            console.error(`❌ DB Connection Error (attempt ${attempt}): ${error.message}`);
            if (attempt < MAX_RETRIES) {
                const delay = attempt * 3000; // 3s, 6s, 9s, 12s, 15s
                console.log(`   Retrying in ${delay / 1000}s...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    console.error('❌ All MongoDB connection attempts failed. Server will run without DB.');
};

module.exports = connectDB;
