const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Create new order (Checkout)
// @route   POST /api/orders/place
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // 1. Fetch user's cart
        const cart = await Cart.findOne({ userId: req.user.id }).populate('products.product');

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        // 2. Calculate total & Prepare order items
        let totalAmount = 0;
        const orderItems = cart.products.map(item => {
            totalAmount += item.product.price * item.quantity;
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            };
        });

        // 3. Create Order
        const order = new Order({
            userId: req.user.id, // Ensure schema uses 'userId' or 'user'
            products: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            status: 'Processing'
        });

        const createdOrder = await order.save();

        // 4. CRITICAL: Clear the cart after successful order
        cart.products = [];
        await cart.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ message: 'Order creation failed' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin
exports.getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'id name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
