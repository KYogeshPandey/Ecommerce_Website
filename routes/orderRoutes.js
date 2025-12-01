const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createOrder, // This handles /place logic
    getMyOrders,
    getAdminOrders
} = require('../controllers/orderController');

// 1. Place Order (Matched with frontend: /orders/place)
// Note: Changed from '/' to '/place' to match your frontend fetch call
router.post('/place', protect, createOrder);

// 2. Get User Orders
router.get('/my', protect, getMyOrders);

// 3. Admin: Get All Orders
router.get('/admin', protect, getAdminOrders);

module.exports = router;
