const express = require('express');
const router = express.Router();

// Import route modules
const categoryRoutes = require('./categories');
const bookingRoutes = require('./bookings');
const adminRoutes = require('./admin');
const partnerRoutes = require('./partner');

// Mount routes
router.use('/categories', categoryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/partner', partnerRoutes);

module.exports = router;
