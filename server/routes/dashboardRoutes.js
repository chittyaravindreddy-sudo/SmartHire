const express = require('express');

const { getDashboardStats } = require('../controllers/dashboardController');

const {
    protect,
    recruiterOnly
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, recruiterOnly, getDashboardStats);

module.exports = router;