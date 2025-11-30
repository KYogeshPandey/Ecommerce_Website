const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, products: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add item to cart
// @route   POST /cart/add
// @access  Private
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, products: [] });
        }

        const itemIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.products[itemIndex].quantity += Number(quantity);
        } else {
            // Product does not exist in cart, add new item
            cart.products.push({ productId, quantity: Number(quantity) });
        }

        await cart.save();
        const updatedCart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id });

        if (cart) {
            cart.products = cart.products.filter(
                (p) => p.productId.toString() !== req.params.productId
            );
            await cart.save();
            const updatedCart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
};
