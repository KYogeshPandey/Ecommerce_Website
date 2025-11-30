const express = require('express');
const router = express.Router();
const { getUserProfile, getUserOrders, getUserCart } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.get('/profile', protect, getUserProfile);
router.get('/orders', protect, getUserOrders);
router.get('/cart', protect, getUserCart);

module.exports = router;
