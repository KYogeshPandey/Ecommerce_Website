const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// 1. Get User Profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 2. Get Dashboard Stats (NEW ROUTE for Frontend)
router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // A. Fetch Orders
        const orders = await Order.find({ userId: userId }); // Use 'userId' consistent with your schema

        // B. Calculate Stats
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        // C. Fetch Cart Count
        const cart = await Cart.findOne({ userId: userId });
        const cartCount = cart && cart.products ? cart.products.length : 0;

        res.json({
            totalOrders,
            totalSpent,
            cartCount
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Error calculating stats' });
    }
});

// 3. Get Recent Orders (For Table)
router.get('/orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5); // Limit to 5 for dashboard
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// 4. Get Cart (Optional - existing route kept)
router.get('/cart', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.json({ products: [] });
        }
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
});

module.exports = router;
