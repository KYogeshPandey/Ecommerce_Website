const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config();

let instance = null;

const isPlaceholder = (val) => !val || val.includes('your_razorpay') || val.includes('dummy') || val.includes('placeholder');

if (!isPlaceholder(process.env.RAZORPAY_KEY_ID) && !isPlaceholder(process.env.RAZORPAY_KEY_SECRET)) {
    try {
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    } catch (err) {
        console.warn('⚠️ Razorpay initialization skipped:', err.message);
        instance = null;
    }
}

module.exports = instance;
