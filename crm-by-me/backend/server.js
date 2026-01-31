/**
 * Main Server Entry Point
 * Employee Management & CRM Portal - Backend API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`📨 ${req.method} ${req.path}`);
        next();
    });
}

// ==================== ROUTES ====================

// API Routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Employee Management & CRM Portal API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            health: '/api/auth/health'
        }
    });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `Duplicate value for ${field}`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 Employee CRM Portal Server Running               ║
║                                                        ║
║   📍 Local:    http://localhost:${PORT}                  ║
║   🌍 Mode:     ${process.env.NODE_ENV || 'development'}                          ║
║   📅 Started:  ${new Date().toLocaleString()}              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});

module.exports = app;