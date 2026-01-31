/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB with recommended options
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options ensure stable connection
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error(`❌ Database Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;