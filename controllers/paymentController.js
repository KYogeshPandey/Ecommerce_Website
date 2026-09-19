const crypto = require('crypto');
const instance = require('../config/razorpay');

const isPlaceholder = (val) => !val || val.includes('your_razorpay') || val.includes('dummy') || val.includes('placeholder');

// @desc    Create Razorpay Order
// @route   POST /payment/create-order or /api/payment/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
    const { amount } = req.body;
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment amount. Must be a finite positive number.'
        });
    }

    if (!instance || isPlaceholder(process.env.RAZORPAY_KEY_ID) || isPlaceholder(process.env.RAZORPAY_KEY_SECRET)) {
        return res.status(503).json({
            success: false,
            message: 'Razorpay online payment is not configured on this server. Please choose Cash on Delivery (COD) or demo checkout.'
        });
    }

    const numericAmount = Math.round(num);

    const options = {
        amount: numericAmount * 100, // amount in paise
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
    };

    try {
        const order = await instance.orders.create(options);
        return res.json(order);
    } catch (error) {
        console.error("Razorpay order creation error:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Payment order creation failed. Please try an alternative payment method.'
        });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /payment/verify or /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(503).json({
            status: 'failure',
            message: 'Payment verification service is unavailable. Missing server configuration.'
        });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                status: 'failure',
                message: 'Missing required payment verification details'
            });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return res.json({ status: 'success', message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ status: 'failure', message: 'Invalid signature' });
        }
    } catch (error) {
        console.error("Payment verification error:", error.message);
        return res.status(500).json({ status: 'failure', message: 'Payment verification failed' });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};
