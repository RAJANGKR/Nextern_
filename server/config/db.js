/* ================================================================
   config/db.js — MongoDB Atlas connection

   TEACH: mongoose.connect() returns a Promise.
   We use async/await to wait for the connection before starting
   the server. If connection fails, we log the error and exit.

   process.exit(1) — exit with error code 1 (non-zero = failure)
   This is important in production so the server doesn't run
   without a database connection.
================================================================ */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options suppress deprecation warnings
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;