const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getCart, 
    addToCart, 
    removeFromCart,
    updateCartQuantity // New Feature needed for +/- buttons
} = require('../controllers/cartController');

// 1. Get Cart (Fetch items with details)
router.get('/', protect, getCart);

// 2. Add Item (Or increase quantity if exists)
router.post('/add', protect, addToCart);

// 3. Update Quantity (For + and - buttons)
// Note: Frontend will call /api/cart/update
router.post('/update', protect, updateCartQuantity);

// 4. Remove Item
// Route: /api/cart/remove/:productId
router.delete('/remove/:productId', protect, removeFromCart);

module.exports = router;
