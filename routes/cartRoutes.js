const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getCart);
router.route('/add').post(protect, addToCart);
router.route('/:productId').delete(protect, removeFromCart);

module.exports = router;
