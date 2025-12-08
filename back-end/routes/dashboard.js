const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

// Get dashboard summary (requires authentication)
router.get('/summary', auth, dashboardController.getSummary);

// Get spending by time period (requires authentication)
router.get('/spending/:period', auth, dashboardController.getSpendingByPeriod);

// Get category breakdown (requires authentication)
router.get('/categories', auth, dashboardController.getCategoryBreakdown);

module.exports = router;
