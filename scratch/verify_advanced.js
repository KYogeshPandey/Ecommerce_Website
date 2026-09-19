const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { spawnSync } = require('child_process');

async function testAdvanced() {
    console.log('🧪 Running Advanced Model & Production Mode Verification Tests...\n');

    // Test 1: Product model numReviews default is 0
    const prod = new Product({
        title: 'Test Product',
        description: 'Test Desc',
        price: 100,
        category: 'Test',
        image: 'http://example.com/img.jpg'
    });
    if (prod.numReviews === 0) {
        console.log('✅ [PASS] Product model numReviews defaults to 0');
    } else {
        console.error('❌ [FAIL] Product model numReviews is ' + prod.numReviews);
    }

    // Test 2: Order model backward compatibility synchronization
    const dummyId = new mongoose.Types.ObjectId();
    const order = new Order({
        userId: new mongoose.Types.ObjectId(),
        products: [{
            product: dummyId,
            productId: dummyId,
            quantity: 2,
            price: 50
        }],
        totalAmount: 100,
        orderStatus: 'Shipped'
    });

    // Validate triggers pre('validate') hook
    await order.validate();
    const itemsSynced = order.items && order.items.length === 1 && order.items[0].price === 50;
    const statusSynced = order.status === 'Shipped';
    if (itemsSynced && statusSynced) {
        console.log('✅ [PASS] Order model items <-> products and status <-> orderStatus synchronize correctly');
    } else {
        console.error('❌ [FAIL] Order model synchronization failed', { itemsSynced, statusSynced, status: order.status });
    }

    // Test 3: Production mode refusal when MongoDB is down
    const prodCheck = spawnSync('node', ['-e', `
        process.env.NODE_ENV = 'production';
        process.env.MONGO_URI = 'mongodb://127.0.0.1:27099/nonexistent';
        const connectDB = require('./config/db');
        connectDB();
    `], { cwd: process.cwd() });

    if (prodCheck.status === 1) {
        console.log('✅ [PASS] Production mode safely exits with code 1 if MongoDB is unavailable');
    } else {
        console.error('❌ [FAIL] Production mode did not exit safely with code 1: ' + prodCheck.status);
    }

    // Test 4: Production mode fatal error when JWT_SECRET is missing
    const jwtCheck = spawnSync('node', ['-e', `
        process.env.NODE_ENV = 'production';
        delete process.env.JWT_SECRET;
        try {
            require('./config/jwt');
            process.exit(0);
        } catch (e) {
            process.exit(2);
        }
    `], { cwd: process.cwd() });

    if (jwtCheck.status === 2) {
        console.log('✅ [PASS] Production mode fatally refuses to start when JWT_SECRET is missing');
    } else {
        console.error('❌ [FAIL] Production mode did not refuse missing JWT_SECRET: ' + jwtCheck.status);
    }

    console.log('\n🎉 All advanced unit & model checks completed!');
}

testAdvanced();
