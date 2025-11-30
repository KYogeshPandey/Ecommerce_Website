const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /orders/create
// @access  Private
const createOrder = async (req, res) => {
    const { items, totalAmount, paymentId } = req.body;

    if (items && items.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    try {
        const order = new Order({
            userId: req.user._id,
            items,
            totalAmount,
            paymentId,
            paymentStatus: 'Completed' // Assuming payment is verified before calling this or updated later
        });

        const createdOrder = await order.save();

        // Clear cart after order
        await Cart.findOneAndDelete({ userId: req.user._id });

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /orders/user
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /orders/admin
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
};
