const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    products: [orderItemSchema],
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    paymentId: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        default: 'COD'
    },
    shippingAddress: {
        type: mongoose.Schema.Types.Mixed,
        default: ''
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Helper to resolve product reference prioritizing whichever property was modified
const getItemRef = (p) => {
    if (!p) return null;
    if (typeof p.isModified === 'function') {
        const prodMod = p.isModified('product');
        const prodIdMod = p.isModified('productId');
        if (prodIdMod && !prodMod) return p.productId;
        if (prodMod && !prodIdMod) return p.product;
    }
    return p.product || p.productId;
};

// Helper to map order items ensuring both product and productId are populated
const mapItems = (arr) => (arr || []).map(p => {
    const ref = getItemRef(p);
    return {
        product: ref,
        productId: ref,
        quantity: p.quantity,
        price: p.price
    };
});

// Helper to keep products <-> items and status <-> orderStatus synchronized safely
function syncOrderFields() {
    // 1. Synchronize status <-> orderStatus using Mongoose modification tracking
    const statusModified = this.isModified('status');
    const orderStatusModified = this.isModified('orderStatus');

    if (orderStatusModified && !statusModified) {
        this.status = this.orderStatus;
    } else if (statusModified && !orderStatusModified) {
        this.orderStatus = this.status;
    } else if (orderStatusModified && statusModified) {
        // When both are modified, treat orderStatus as canonical
        this.status = this.orderStatus;
    } else {
        // Backfill if one is empty
        if (!this.status && this.orderStatus) {
            this.status = this.orderStatus;
        } else if (!this.orderStatus && this.status) {
            this.orderStatus = this.status;
        }
    }

    // 2. Synchronize products <-> items using Mongoose modification tracking
    const productsModified = this.isModified('products');
    const itemsModified = this.isModified('items');

    const hasProducts = Array.isArray(this.products) && this.products.length > 0;
    const hasItems = Array.isArray(this.items) && this.items.length > 0;

    if (productsModified && !itemsModified) {
        this.items = mapItems(this.products);
    } else if (itemsModified && !productsModified) {
        this.products = mapItems(this.items);
    } else if (productsModified && itemsModified) {
        // Both modified: treat products as canonical if populated, otherwise items
        if (hasProducts) {
            this.items = mapItems(this.products);
        } else if (hasItems) {
            this.products = mapItems(this.items);
        }
    } else {
        // Neither modified: backfill missing array if one exists
        if (hasProducts && !hasItems) {
            this.items = mapItems(this.products);
        } else if (hasItems && !hasProducts) {
            this.products = mapItems(this.items);
        }
    }

    // Ensure item elements keep product and productId in lockstep
    if (this.products) {
        this.products.forEach(p => {
            const ref = getItemRef(p);
            if (ref) {
                p.product = ref;
                p.productId = ref;
            }
        });
    }
    if (this.items) {
        this.items.forEach(p => {
            const ref = getItemRef(p);
            if (ref) {
                p.product = ref;
                p.productId = ref;
            }
        });
    }
}

// Synchronize query-based update payloads (findOneAndUpdate, updateOne, updateMany)
function syncUpdatePayload(update) {
    if (!update) return;

    if (update.orderStatus && !update.status) {
        update.status = update.orderStatus;
    } else if (update.status && !update.orderStatus) {
        update.orderStatus = update.status;
    }

    if (update.items && !update.products) {
        update.products = mapItems(update.items);
    } else if (update.products && !update.items) {
        update.items = mapItems(update.products);
    }

    if (update.$set) {
        if (update.$set.orderStatus && !update.$set.status) {
            update.$set.status = update.$set.orderStatus;
        } else if (update.$set.status && !update.$set.orderStatus) {
            update.$set.orderStatus = update.$set.status;
        }

        if (update.$set.items && !update.$set.products) {
            update.$set.products = mapItems(update.$set.items);
        } else if (update.$set.products && !update.$set.items) {
            update.$set.items = mapItems(update.$set.products);
        }
    }
}

orderSchema.pre('validate', function(next) {
    syncOrderFields.call(this);
    this.$locals = this.$locals || {};
    this.$locals.orderFieldsSynced = true;
    next();
});

orderSchema.pre('save', function(next) {
    if (!this.$locals?.orderFieldsSynced) {
        syncOrderFields.call(this);
    }
    if (this.$locals) {
        this.$locals.orderFieldsSynced = false;
    }
    next();
});

orderSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    const update = this.getUpdate();
    syncUpdatePayload(update);
    if (typeof next === 'function') next();
});

module.exports = mongoose.model('Order', orderSchema);
