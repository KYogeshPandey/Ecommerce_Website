const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAdminOrders,
    updateOrderStatus
} = require('../controllers/orderController');

// 1. Place Order (supports both /place and /)
router.post('/place', protect, createOrder);
router.post('/', protect, createOrder);

// 2. Get User Orders (supports both /my and /myorders)
router.get('/my', protect, getMyOrders);
router.get('/myorders', protect, getMyOrders);

// 3. Admin: Get All Orders
router.get('/admin', protect, admin, getAdminOrders);

// 4. Admin: Update Order Status
router.put('/:id/status', protect, admin, updateOrderStatus);

// 5. Get Single Order by ID
router.get('/:id', protect, getOrderById);

module.exports = router;
