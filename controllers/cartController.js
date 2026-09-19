const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { FALLBACK_PRODUCTS } = require('./productController');

// In-memory demo cart storage keyed by userId
const demoCartsByUser = new Map();

const getDemoCart = (userId) => {
    if (!demoCartsByUser.has(userId)) {
        demoCartsByUser.set(userId, []);
    }
    return demoCartsByUser.get(userId);
};

// Helper to resolve a full product document/object for demo cart items
const resolveProduct = async (productId) => {
    const idStr = String(productId);
    if (mongoose.connection.readyState === 1) {
        try {
            const doc = await Product.findById(idStr);
            if (doc) return doc;
        } catch {}
    }

    if (FALLBACK_PRODUCTS && Array.isArray(FALLBACK_PRODUCTS)) {
        const match = FALLBACK_PRODUCTS.find(p => p._id === idStr);
        if (match) return match;
    }

    // Default populated product stub conforming to schema
    return {
        _id: idStr,
        title: 'Sample Product',
        price: 4999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
        category: 'General',
        description: 'Quality merchandise curated for ShopEase shoppers.',
        stock: 10,
        rating: 4.5,
        numReviews: 0
    };
};

// @desc    Get User Cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        const demoProducts = getDemoCart(req.user.id || 'demo-user-id');
        for (const item of demoProducts) {
            if (!item.product || typeof item.product === 'string' || !item.product.title) {
                item.product = await resolveProduct(item.product || item.productId);
            }
            if (!item._id) {
                item._id = 'item-demo-' + (item.product?._id || 'item');
            }
        }

        return res.status(200).json({
            _id: 'cart-demo-' + (req.user.id || 'demo-user-id'),
            userId: req.user.id || 'demo-user-id',
            products: demoProducts
        });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate({
                path: 'products.product',
                model: 'Product',
                strictPopulate: false // Bypasses schema error
            });

        if (!cart) {
            return res.status(200).json({
                _id: null,
                userId: req.user.id,
                products: []
            });
        }

        // Filter out any items where the product might have been deleted from DB
        cart.products = cart.products.filter(item => item.product !== null);

        return res.json(cart);
    } catch (error) {
        console.error("Cart Error:", error);
        return res.status(500).json({ message: 'Failed to retrieve cart' });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    const rawQty = quantity === undefined ? 1 : Number(quantity);
    if (!Number.isInteger(rawQty) || rawQty <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }
    const qty = rawQty;

    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        // Resolve product document before index lookup to prevent race condition duplicates
        const productDoc = await resolveProduct(productId);
        const demoProducts = getDemoCart(req.user.id || 'demo-user-id');
        const idStr = String(productId);

        const itemIndex = demoProducts.findIndex(p =>
            p.product && (String(p.product._id) === idStr || String(p.product) === idStr)
        );

        if (itemIndex > -1) {
            demoProducts[itemIndex].quantity += qty;
        } else {
            demoProducts.push({
                _id: 'item-demo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
                product: productDoc,
                quantity: qty
            });
        }

        return res.status(200).json({
            _id: 'cart-demo-' + (req.user.id || 'demo-user-id'),
            userId: req.user.id || 'demo-user-id',
            message: 'Item added to demo cart',
            products: demoProducts
        });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (cart) {
            cart.products = cart.products.filter(p => p.product);

            const itemIndex = cart.products.findIndex(p => 
                p.product && p.product.toString() === String(productId)
            );

            if (itemIndex > -1) {
                cart.products[itemIndex].quantity += qty;
            } else {
                cart.products.push({ product: productId, quantity: qty });
            }
        } else {
            cart = new Cart({
                userId: req.user.id,
                products: [{ product: productId, quantity: qty }]
            });
        }
        
        await cart.save();
        
        await cart.populate({
            path: 'products.product',
            model: 'Product',
            strictPopulate: false
        });

        return res.status(200).json(cart);
    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ message: 'Failed to update cart' });
    }
};

// @desc    Update item quantity
// @route   POST /api/cart/update
exports.updateCartQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    if (quantity === undefined || quantity === null || quantity === '') {
        return res.status(400).json({ message: 'Quantity is required' });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) {
        return res.status(400).json({ message: 'Quantity must be a non-negative integer' });
    }

    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        const demoProducts = getDemoCart(req.user.id || 'demo-user-id');
        const idStr = String(productId);
        const itemIndex = demoProducts.findIndex(p =>
            p.product && (String(p.product._id) === idStr || String(p.product) === idStr)
        );

        if (itemIndex > -1) {
            if (qty > 0) {
                demoProducts[itemIndex].quantity = qty;
            } else {
                demoProducts.splice(itemIndex, 1);
            }
            return res.status(200).json({
                _id: 'cart-demo-' + (req.user.id || 'demo-user-id'),
                userId: req.user.id || 'demo-user-id',
                message: 'Cart updated',
                products: demoProducts,
                success: true
            });
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.products.findIndex(p => p.product && p.product.toString() === String(productId));
        
        if (itemIndex > -1) {
            if (qty > 0) {
                cart.products[itemIndex].quantity = qty;
            } else {
                cart.products.splice(itemIndex, 1);
            }
            await cart.save();
            await cart.populate({
                path: 'products.product',
                model: 'Product',
                strictPopulate: false
            });
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ message: 'Failed to update cart quantity' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
exports.removeFromCart = async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    if (mongoose.connection.readyState !== 1 || req.user.isDemo) {
        const demoProducts = getDemoCart(req.user.id || 'demo-user-id');
        const idStr = String(productId);
        const itemIndex = demoProducts.findIndex(p =>
            p.product && (String(p.product._id) === idStr || String(p.product) === idStr)
        );

        if (itemIndex > -1) {
            demoProducts.splice(itemIndex, 1);
            return res.status(200).json({
                _id: 'cart-demo-' + (req.user.id || 'demo-user-id'),
                userId: req.user.id || 'demo-user-id',
                message: 'Item removed from demo cart',
                products: demoProducts,
                success: true
            });
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.products = cart.products.filter(
                (item) => item.product && item.product.toString() !== String(productId)
            );
            await cart.save();
            await cart.populate({
                path: 'products.product',
                model: 'Product',
                strictPopulate: false
            });
            return res.json(cart);
        } else {
            return res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        console.error("Remove Cart Error:", error);
        return res.status(500).json({ message: 'Failed to remove item from cart' });
    }
};
