const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get User Cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate({
                path: 'products.product',
                model: 'Product',
                strictPopulate: false // Bypasses schema error
            });

        if (!cart) {
            return res.status(200).json({ products: [] });
        }

        // Filter out any items where the product might have been deleted from DB
        cart.products = cart.products.filter(item => item.product !== null);

        res.json(cart);
    } catch (error) {
        console.error("Cart Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (cart) {
            // **SAFETY FIX**: First, filter out any corrupt items from the cart
            cart.products = cart.products.filter(p => p.product);

            // Now, safely find the item index
            const itemIndex = cart.products.findIndex(p => 
                p.product && p.product.toString() === productId
            );

            if (itemIndex > -1) {
                cart.products[itemIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }
        } else {
            cart = new Cart({
                userId: req.user.id,
                products: [{ product: productId, quantity }]
            });
        }
        
        await cart.save();
        
        // Populate the cart to send back full product details
        await cart.populate({
            path: 'products.product',
            model: 'Product',
            strictPopulate: false
        });

        res.status(200).json(cart);
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update item quantity
// @route   POST /api/cart/update
exports.updateCartQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // **SAFETY FIX**: Find index safely
        const itemIndex = cart.products.findIndex(p => p.product && p.product.toString() === productId);
        
        if (itemIndex > -1) {
            if (quantity > 0) {
                cart.products[itemIndex].quantity = quantity;
            } else {
                cart.products.splice(itemIndex, 1);
            }
            await cart.save();
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            // **SAFETY FIX**: Filter safely
            cart.products = cart.products.filter(
                (item) => item.product && item.product.toString() !== req.params.productId
            );
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
