const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Get user profile
// @route   GET /user/profile
// @access  Private (Buyer only)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            phone: user.phone,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's order history
// @route   GET /user/orders
// @access  Private (Buyer only)
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('products.productId', 'title price image')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's cart
// @route   GET /user/cart
// @access  Private (Buyer only)
const getUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate('products.productId', 'title price image stock');

        if (!cart) {
            return res.json({ products: [], totalAmount: 0 });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    getUserOrders,
    getUserCart
};
