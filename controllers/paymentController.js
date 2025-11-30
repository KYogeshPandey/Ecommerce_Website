const Razorpay = require('razorpay');
const crypto = require('crypto');
const instance = require('../config/razorpay');
const Order = require('../models/Order');

// @desc    Create Razorpay Order
// @route   POST /payment/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
    const { amount } = req.body;

    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
    };

    try {
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        res.json({ status: 'success', message: 'Payment verified successfully' });
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};
