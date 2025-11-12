const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get dashboard summary
router.get('/summary', dashboardController.getSummary);

// Get spending by time period (week, month, quarter, year)
router.get('/spending/:period', dashboardController.getSpendingByPeriod);

// Get category breakdown
router.get('/categories', dashboardController.getCategoryBreakdown);

module.exports = router;
