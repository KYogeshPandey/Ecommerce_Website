const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            // The field name here MUST be 'product' to match populate('products.product')
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Ensure this matches your Product model name (case-sensitive)
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
