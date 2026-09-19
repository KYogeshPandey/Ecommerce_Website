const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Immutable baseline seed order for initial demo rendering
const BASE_DEMO_ORDERS = [
    {
        _id: 'ORD-892415',
        userId: 'demo-buyer-id',
        createdAt: new Date(Date.now() - 86400000 * 2),
        totalAmount: 14999,
        status: 'Delivered',
        orderStatus: 'Delivered',
        paymentMethod: 'COD',
        shippingAddress: { name: 'Demo Buyer', city: 'Mumbai', address: '42 Cyber Road, Bandra' },
        products: [
            {
                product: {
                    _id: '1',
                    title: 'Titanium Audio Pulse Pro',
                    price: 14999,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
                    category: 'Audio'
                },
                productId: '1',
                quantity: 1,
                price: 14999
            }
        ],
        items: [
            {
                product: {
                    _id: '1',
                    title: 'Titanium Audio Pulse Pro',
                    price: 14999,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
                    category: 'Audio'
                },
                productId: '1',
                quantity: 1,
                price: 14999
            }
        ]
    }
];

// In-memory store keyed by userId to prevent cross-user data leakage in demo mode
const demoOrdersByUser = new Map();

const getUserDemoOrders = (userId) => {
    if (!demoOrdersByUser.has(userId)) {
        const initial = userId === 'demo-buyer-id' 
            ? JSON.parse(JSON.stringify(BASE_DEMO_ORDERS)) 
            : [];
        demoOrdersByUser.set(userId, initial);
    }
    return demoOrdersByUser.get(userId);
};

// @desc    Create new order (Checkout)
// @route   POST /orders/place or POST /orders
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, items: directItems, products: directProducts } = req.body;

        // Offline / Demo fallback
        if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
            const rawList = directProducts || directItems || [];
            const mockItems = rawList.length > 0 ? rawList : [
                {
                    product: {
                        _id: '1',
                        title: 'Titanium Audio Pulse Pro',
                        price: 14999,
                        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
                    },
                    productId: '1',
                    quantity: 1,
                    price: 14999
                }
            ];

            let computedTotal = 0;
            mockItems.forEach(item => {
                const p = Number(item.price || item.product?.price || 0);
                const q = Number(item.quantity || 1);
                computedTotal += p * q;
            });

            const clientTotal = Number(req.body.totalAmount);
            const finalTotal = computedTotal > 0 ? computedTotal : (Number.isFinite(clientTotal) && clientTotal > 0 ? clientTotal : 14999);

            const mockOrder = {
                _id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
                userId: req.user.id || 'demo-user-id',
                products: mockItems,
                items: mockItems,
                totalAmount: finalTotal,
                shippingAddress: shippingAddress || {},
                paymentMethod: paymentMethod || 'COD',
                status: 'Processing',
                orderStatus: 'Processing',
                createdAt: new Date(),
                isDemo: true
            };

            const userOrders = getUserDemoOrders(req.user.id || 'demo-user-id');
            userOrders.unshift(mockOrder);
            return res.status(201).json(mockOrder);
        }

        // 1. Fetch user's cart if MongoDB is connected
        let cart = null;
        try {
            cart = await Cart.findOne({ userId: req.user.id }).populate('products.product');
        } catch {
            cart = null;
        }

        let orderItems = [];
        let serverCartTotal = 0;
        let hasCartItems = false;

        if (cart && cart.products && cart.products.length > 0) {
            const validCartProducts = cart.products.filter(item => item.product);
            if (validCartProducts.length > 0) {
                hasCartItems = true;
                orderItems = validCartProducts.map(item => {
                    const price = Number(item.product.price) || 0;
                    serverCartTotal += price * (Number(item.quantity) || 1);
                    return {
                        product: item.product._id,
                        productId: item.product._id,
                        quantity: Number(item.quantity) || 1,
                        price: price
                    };
                });
            }
        }

        let directComputedTotal = 0;
        if (!hasCartItems && ((directItems && directItems.length > 0) || (directProducts && directProducts.length > 0))) {
            const rawList = directProducts || directItems;
            for (const item of rawList) {
                const pId = item.product || item.productId || item._id;
                if (!pId || !mongoose.Types.ObjectId.isValid(pId)) {
                    return res.status(400).json({ message: 'Invalid product ID in order items' });
                }
                const qty = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                directComputedTotal += price * qty;
                orderItems.push({
                    product: pId,
                    productId: pId,
                    quantity: qty,
                    price: price
                });
            }
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ message: 'No items in cart to order' });
        }

        // Security fix: Never overwrite server-computed cart total with client body
        let finalTotal;
        if (hasCartItems) {
            finalTotal = serverCartTotal;
        } else if (directComputedTotal > 0) {
            finalTotal = directComputedTotal;
        } else {
            const clientTotal = Number(req.body.totalAmount);
            if (Number.isFinite(clientTotal) && clientTotal > 0) {
                finalTotal = clientTotal;
            } else {
                return res.status(400).json({ message: 'Invalid order total amount' });
            }
        }

        const order = new Order({
            userId: req.user.id,
            products: orderItems,
            items: orderItems,
            totalAmount: finalTotal,
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || 'COD',
            status: 'Processing',
            orderStatus: 'Processing'
        });

        const createdOrder = await order.save();

        if (cart) {
            cart.products = [];
            await cart.save();
        }

        return res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Order Error:", error);
        return res.status(500).json({ message: 'Order creation failed', error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /orders/my or GET /orders/myorders
exports.getMyOrders = async (req, res) => {
    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        const userOrders = getUserDemoOrders(req.user.id || 'demo-user-id');
        return res.json(userOrders);
    }

    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('products.product')
            .populate('items.productId')
            .sort({ createdAt: -1 });
        return res.json(orders);
    } catch (error) {
        console.error("Get My Orders Error:", error);
        return res.status(500).json({ message: 'Failed to retrieve orders' });
    }
};

// @desc    Get single order by ID
// @route   GET /orders/:id
exports.getOrderById = async (req, res) => {
    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        const userOrders = getUserDemoOrders(req.user.id || 'demo-user-id');
        let demo = userOrders.find(o => o._id === req.params.id);

        if (!demo && (req.user.role === 'admin' || req.user.role === 'seller')) {
            for (const orders of demoOrdersByUser.values()) {
                demo = orders.find(o => o._id === req.params.id);
                if (demo) break;
            }
            if (!demo) {
                demo = BASE_DEMO_ORDERS.find(o => o._id === req.params.id);
            }
        }

        if (!demo) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.json(demo);
    }

    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('products.product')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security fix: Guard against null order.userId after populate
        const orderOwnerId = order.userId?._id ? order.userId._id.toString() : (order.userId ? order.userId.toString() : null);

        if (!orderOwnerId || (orderOwnerId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'seller')) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        return res.json(order);
    } catch (error) {
        console.error("Get Order Error:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders (Admin/Seller)
// @route   GET /orders/admin
exports.getAdminOrders = async (req, res) => {
    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        const allDemoOrders = [];
        const seenIds = new Set();
        for (const orders of demoOrdersByUser.values()) {
            for (const order of orders) {
                if (!seenIds.has(order._id)) {
                    seenIds.add(order._id);
                    allDemoOrders.push(order);
                }
            }
        }
        for (const order of BASE_DEMO_ORDERS) {
            if (!seenIds.has(order._id)) {
                seenIds.add(order._id);
                allDemoOrders.push(order);
            }
        }
        return res.json(allDemoOrders);
    }

    try {
        const orders = await Order.find({})
            .populate('userId', 'id name email')
            .populate('products.product')
            .populate('items.productId')
            .sort({ createdAt: -1 });
        return res.json(orders);
    } catch (error) {
        console.error("Admin Orders Error:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status (Admin/Seller)
// @route   PUT /orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const ALLOWED_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}` });
    }

    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        let demo = null;
        for (const orders of demoOrdersByUser.values()) {
            demo = orders.find(o => o._id === req.params.id);
            if (demo) break;
        }
        if (!demo) {
            const base = BASE_DEMO_ORDERS.find(o => o._id === req.params.id);
            if (base) {
                demo = JSON.parse(JSON.stringify(base));
                const targetUserId = base.userId || 'demo-buyer-id';
                getUserDemoOrders(targetUserId).unshift(demo);
            }
        }

        if (!demo) {
            return res.status(404).json({ message: 'Order not found' });
        }

        demo.status = status;
        demo.orderStatus = status;
        return res.json(demo);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Order not found' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        order.orderStatus = status;
        const updatedOrder = await order.save();
        return res.json(updatedOrder);
    } catch (error) {
        console.error("Update Order Status Error:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};
