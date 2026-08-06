// server.js – Main entry point for the Housing.com clone backend

// ========== 1. Load environment variables ==========
require('dotenv').config();

// ========== 2. Import dependencies ==========
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// ========== 3. Initialize Express app ==========
const app = express();

// ========== 4. Middleware ==========

// Enable CORS (allow frontend to access this API)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // your React app URL
    credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded property images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== 5. Import Routes ==========
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const localityRoutes = require('./routes/localityRoutes');

// ========== 6. Use Routes ==========
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/localities', localityRoutes);

// ========== 7. Health check endpoint ==========
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// ========== 8. 404 handler ==========
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ========== 9. Global error handler ==========
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

// ========== 10. Connect to MongoDB and start server ==========
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});