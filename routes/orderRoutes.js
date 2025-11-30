const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.route('/create').post(protect, createOrder);
router.route('/user').get(protect, getMyOrders);
router.route('/admin').get(protect, admin, getAllOrders);

module.exports = router;
