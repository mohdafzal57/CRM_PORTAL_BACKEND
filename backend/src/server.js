/**
 * Main Server Entry Point
 * Employee Management & CRM Portal - Backend API
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Import HTTP
const socketIo = require('socket.io'); // Import Socket.io
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const hrRoutes = require('./routes/hrRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const internRoutes = require('./routes/internRoutes');
const attendanceRoutes = require('./routes/attendance.routes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true
    }
});

// Make io accessible globally or pass it to routes
app.set('io', io);
global.io = io;

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Connect to MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// Enable CORS for frontend
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ["http://localhost:5173"];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            return callback(null, true);
        } else {
            // For development, be lenient if needed, or strictly enforce production
            // callback(new Error('Not allowed by CORS'), false);
            return callback(null, true); // Temporary Dev Fix if needed
        }
    },
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
// Admin Routes
app.use('/api/admin', adminRoutes);
// Intern Routes
app.use('/api/intern', internRoutes);
// Attendance Routes (User side)
app.use('/api/attendance', attendanceRoutes);
// Notification Routes
app.use('/api/notifications', notificationRoutes);
// HR Routes
app.use('/api/hr', hrRoutes);

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

    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid resource ID: ${err.value}`
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

const PORT = process.env.PORT || 9999;

// Use server.listen instead of app.listen
server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
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
    // process.exit(1); // Optional: keep running or restart
});

module.exports = app;