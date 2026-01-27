const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const healthcheckRoutes = require('./routes/healthcheckRoute');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

app.set('trust proxy', true);

// Security HTTP headers
app.use(helmet());

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


// Rate limiting
const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/healthcheck', healthcheckRoutes);
app.get("/hell", (req, res) => {
    res.send("hello");
})

// // Handle undefined routes
// app.all('*', (req, res, next) => {
//     next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
// });

// Global error handler
app.use(errorHandler);

module.exports = app;