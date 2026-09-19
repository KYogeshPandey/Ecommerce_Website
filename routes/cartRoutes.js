const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getCart, 
    addToCart, 
    removeFromCart,
    updateCartQuantity
} = require('../controllers/cartController');

// 1. Get Cart (Fetch items with details)
router.get('/', protect, getCart);

// 2. Add Item (Or increase quantity if exists)
router.post('/add', protect, addToCart);
router.post('/', protect, addToCart);

// 3. Update Quantity (supports both POST and PUT)
router.post('/update', protect, updateCartQuantity);
router.put('/update', protect, updateCartQuantity);
router.put('/', protect, updateCartQuantity);

// 4. Remove Item (supports both /remove/:productId and /:productId)
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
