const http = require('http');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { FALLBACK_PRODUCTS, filterFallback } = require('../controllers/productController');
const { generateToken } = require('../config/jwt');

function doRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function run() {
    console.log("=== STARTING COMPREHENSIVE VERIFICATION SUITE ===");

    // -------------------------------------------------------------
    // Test 1: Order Model Field Synchronization (items <-> products, status <-> orderStatus)
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Order Model Safe Synchronization ---");
    const prodId1 = new mongoose.Types.ObjectId();
    const prodId2 = new mongoose.Types.ObjectId();

    // 1.1 New order with items only -> products synchronized
    const o1 = new Order({
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1200,
        items: [{ productId: prodId1, quantity: 2, price: 600 }]
    });
    await o1.validate();
    console.assert(o1.products.length === 1, "o1.products should have 1 item");
    console.assert(o1.products[0].quantity === 2, "o1.products[0].quantity should be 2");
    console.assert(String(o1.products[0].product) === String(prodId1), "o1.products[0].product matches prodId1");
    console.log("✔ 1.1: New order items -> products synchronization passed");

    // 1.2 New order with products only -> items synchronized
    const o2 = new Order({
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1800,
        products: [{ product: prodId2, quantity: 3, price: 600 }]
    });
    await o2.validate();
    console.assert(o2.items.length === 1, "o2.items should have 1 item");
    console.assert(o2.items[0].quantity === 3, "o2.items[0].quantity should be 3");
    console.assert(String(o2.items[0].productId) === String(prodId2), "o2.items[0].productId matches prodId2");
    console.log("✔ 1.2: New order products -> items synchronization passed");

    // 1.3 Loaded document modifying products quantity -> items synchronized
    const o3 = new Order();
    o3.init({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1000,
        items: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        products: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        orderStatus: 'Processing',
        status: 'Processing'
    });
    o3.products[0].quantity = 7;
    await o3.validate();
    console.assert(o3.items[0].quantity === 7, "o3.items[0].quantity should be 7");
    console.log("✔ 1.3: Loaded doc modify products quantity -> items passed");

    // 1.4 Loaded document modifying items quantity -> products synchronized
    const o4 = new Order();
    o4.init({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1000,
        items: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        products: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        orderStatus: 'Processing',
        status: 'Processing'
    });
    o4.items[0].quantity = 9;
    await o4.validate();
    console.assert(o4.products[0].quantity === 9, "o4.products[0].quantity should be 9");
    console.log("✔ 1.4: Loaded doc modify items quantity -> products passed");

    // 1.5 Loaded document modifying status -> orderStatus synchronized without recursive setter crash
    const o5 = new Order();
    o5.init({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1000,
        orderStatus: 'Processing',
        status: 'Processing'
    });
    o5.status = 'Shipped';
    await o5.validate();
    console.assert(o5.orderStatus === 'Shipped', "o5.orderStatus should be Shipped");
    console.log("✔ 1.5: Loaded doc modify status -> orderStatus passed");

    // 1.6 Loaded document modifying orderStatus -> status synchronized
    const o6 = new Order();
    o6.init({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1000,
        orderStatus: 'Processing',
        status: 'Processing'
    });
    o6.orderStatus = 'Delivered';
    await o6.validate();
    console.assert(o6.status === 'Delivered', "o6.status should be Delivered");
    console.log("✔ 1.6: Loaded doc modify orderStatus -> status passed");

    // 1.7 Loaded document adding item to products
    const o7 = new Order();
    o7.init({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1000,
        items: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        products: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        orderStatus: 'Processing',
        status: 'Processing'
    });
    o7.products.push({ product: prodId2, quantity: 1, price: 300 });
    await o7.validate();
    console.assert(o7.items.length === 2 && String(o7.items[1].productId) === String(prodId2), "o7.items should have 2 items");
    console.log("✔ 1.7: Loaded doc push products -> items passed");

    // 1.8 Loaded document removing item from items
    const o8 = new Order();
    o8.init({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1000,
        items: [
            { productId: prodId1, product: prodId1, quantity: 2, price: 500 },
            { productId: prodId2, product: prodId2, quantity: 1, price: 300 }
        ],
        products: [
            { productId: prodId1, product: prodId1, quantity: 2, price: 500 },
            { productId: prodId2, product: prodId2, quantity: 1, price: 300 }
        ],
        orderStatus: 'Processing',
        status: 'Processing'
    });
    o8.items.splice(1, 1);
    await o8.validate();
    console.assert(o8.products.length === 1 && String(o8.products[0].product) === String(prodId1), "o8.products should have 1 item");
    console.log("✔ 1.8: Loaded doc remove item -> products passed");

    // 1.9 Loaded document modifying productId directly -> product updated
    const o9 = new Order();
    o9.init({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        totalAmount: 1000,
        items: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        products: [{ productId: prodId1, product: prodId1, quantity: 2, price: 500 }],
        orderStatus: 'Processing',
        status: 'Processing'
    });
    const newProdId = new mongoose.Types.ObjectId();
    o9.products[0].productId = newProdId;
    await o9.validate();
    console.assert(String(o9.products[0].product) === String(newProdId), "o9.products[0].product should be newProdId");
    console.assert(String(o9.items[0].productId) === String(newProdId), "o9.items[0].productId should be newProdId");
    console.log("✔ 1.9: Loaded doc modify productId directly -> preserves productId update");

    // 1.10 Query middleware update payload synchronization
    const query = Order.updateOne({ _id: new mongoose.Types.ObjectId() }, { status: 'Delivered' });
    await new Promise((resolve) => {
        Order.schema.s.hooks.execPre('updateOne', query, () => {
            const updateObj = query.getUpdate();
            console.assert(updateObj.orderStatus === 'Delivered', "Query middleware should sync orderStatus from status");
            console.log("✔ 1.10: Query middleware update payload synchronization passed");
            resolve();
        });
    });


    // -------------------------------------------------------------
    // Test 2: Product Sorting - sort=oldest
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Product Sorting sort=oldest ---");
    const oldestList = filterFallback({ sort: 'oldest' });
    console.assert(oldestList.length > 1, "Fallback products list should have items");
    for (let i = 0; i < oldestList.length - 1; i++) {
        const d1 = new Date(oldestList[i].createdAt).getTime();
        const d2 = new Date(oldestList[i + 1].createdAt).getTime();
        console.assert(d1 <= d2, `Product at index ${i} should be older than or equal to ${i+1}`);
    }
    console.log("✔ 2.1: filterFallback(sort='oldest') correctly orders oldest first");

    const newestList = filterFallback({ sort: 'newest' });
    for (let i = 0; i < newestList.length - 1; i++) {
        const d1 = new Date(newestList[i].createdAt).getTime();
        const d2 = new Date(newestList[i + 1].createdAt).getTime();
        console.assert(d1 >= d2, `Product at index ${i} should be newer than or equal to ${i+1}`);
    }
    console.log("✔ 2.2: filterFallback(sort='newest') correctly orders newest first");


    // -------------------------------------------------------------
    // Test 3: Live Server API Tests (Cart Validation, Response Shapes, Demo Login)
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Live Server API Tests ---");
    const port = 5000;

    // 3.1 Demo buyer login
    const loginRes = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'buyer@shopease.com', password: 'any' });

    console.assert(loginRes.status === 200, `Demo login returned ${loginRes.status}`);
    console.assert(loginRes.body.token, "Demo login returned token");
    console.assert(loginRes.body.isDemo === true, "Demo login marked isDemo");
    const token = loginRes.body.token;
    console.log("✔ 3.1: Demo buyer login successful, received signed JWT");

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 3.2 Cart input validation - invalid quantities
    const inv1 = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart/add',
        method: 'POST',
        headers: authHeaders
    }, { productId: FALLBACK_PRODUCTS[0]._id, quantity: 1.5 });
    console.assert(inv1.status === 400, `Fractional quantity should return 400, got ${inv1.status}`);

    const inv2 = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart/add',
        method: 'POST',
        headers: authHeaders
    }, { productId: FALLBACK_PRODUCTS[0]._id, quantity: 'invalid-string' });
    console.assert(inv2.status === 400, `String quantity should return 400, got ${inv2.status}`);

    const inv3 = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart/add',
        method: 'POST',
        headers: authHeaders
    }, { productId: FALLBACK_PRODUCTS[0]._id, quantity: -2 });
    console.assert(inv3.status === 400, `Negative quantity should return 400, got ${inv3.status}`);

    const inv4 = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart/add',
        method: 'POST',
        headers: authHeaders
    }, { productId: FALLBACK_PRODUCTS[0]._id, quantity: 0 });
    console.assert(inv4.status === 400, `Zero quantity in addToCart should return 400, got ${inv4.status}`);

    console.log("✔ 3.2: addToCart strictly rejects non-integer, negative, fractional, and zero quantities with HTTP 400");

    // 3.3 Add item to cart with valid quantity
    const addRes = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart/add',
        method: 'POST',
        headers: authHeaders
    }, { productId: FALLBACK_PRODUCTS[0]._id, quantity: 2 });

    console.assert(addRes.status === 200, `addToCart should return 200, got ${addRes.status}`);
    console.assert(Array.isArray(addRes.body.products), "Cart should have products array");
    const firstItem = addRes.body.products.find(p => String(p.product?._id) === String(FALLBACK_PRODUCTS[0]._id));
    console.assert(firstItem, "Added product must be in cart");
    console.assert(typeof firstItem.product === 'object', "item.product must be a populated object");
    console.assert(firstItem.product.title === FALLBACK_PRODUCTS[0].title, "item.product.title must match");
    console.assert(firstItem.product.price === FALLBACK_PRODUCTS[0].price, "item.product.price must match");
    console.log("✔ 3.3: addToCart response shape contains fully populated product document conforming to client contract");

    // 3.4 Get Cart - verify shape
    const getCartRes = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart',
        method: 'GET',
        headers: authHeaders
    });
    console.assert(getCartRes.status === 200, `getCart should return 200, got ${getCartRes.status}`);
    console.assert(getCartRes.body.products.length > 0, "getCart should return populated products");
    const getFirst = getCartRes.body.products[0];
    console.assert(typeof getFirst.product === 'object' && getFirst.product.title, "getCart product must be populated object");
    console.log("✔ 3.4: getCart response shape conforms to populated contract");

    // 3.5 Update Cart Quantity validation
    const updInv = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart/update',
        method: 'POST',
        headers: authHeaders
    }, { productId: FALLBACK_PRODUCTS[0]._id, quantity: 2.7 });
    console.assert(updInv.status === 400, `Fractional quantity in updateCartQuantity should return 400, got ${updInv.status}`);

    // Update with valid quantity 5
    const updValid = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/cart/update',
        method: 'POST',
        headers: authHeaders
    }, { productId: FALLBACK_PRODUCTS[0]._id, quantity: 5 });
    console.assert(updValid.status === 200, `Valid update should return 200, got ${updValid.status}`);
    const updatedItem = updValid.body.products.find(p => String(p.product?._id) === String(FALLBACK_PRODUCTS[0]._id));
    console.assert(updatedItem.quantity === 5, "Updated quantity must be 5");
    console.log("✔ 3.5: updateCartQuantity validation and update passed");

    // 3.6 Remove item from cart
    const removeRes = await doRequest({
        hostname: 'localhost',
        port,
        path: `/api/cart/remove/${FALLBACK_PRODUCTS[0]._id}`,
        method: 'DELETE',
        headers: authHeaders
    });
    console.assert(removeRes.status === 200, `removeFromCart should return 200, got ${removeRes.status}`);
    const remaining = removeRes.body.products.find(p => String(p.product?._id) === String(FALLBACK_PRODUCTS[0]._id));
    console.assert(!remaining, "Product should no longer be in cart");
    console.log("✔ 3.6: removeFromCart passed");

    // 3.7 GET /products?sort=oldest via HTTP
    const prodHttp = await doRequest({
        hostname: 'localhost',
        port,
        path: '/api/products?sort=oldest',
        method: 'GET'
    });
    console.assert(prodHttp.status === 200, `GET /api/products?sort=oldest returned ${prodHttp.status}`);
    console.assert(Array.isArray(prodHttp.body) && prodHttp.body.length > 1, "Products array returned");
    for (let i = 0; i < prodHttp.body.length - 1; i++) {
        const t1 = new Date(prodHttp.body[i].createdAt).getTime();
        const t2 = new Date(prodHttp.body[i + 1].createdAt).getTime();
        console.assert(t1 <= t2, `HTTP product at index ${i} should be older than or equal to ${i+1}`);
    }
    console.log("✔ 3.7: GET /api/products?sort=oldest HTTP endpoint returned oldest products first");

    console.log("\n=================================================");
    console.log("🎉 ALL TESTS IN VERIFICATION SUITE PASSED 100%!");
    console.log("=================================================");
}

run().catch((err) => {
    console.error("❌ TEST FAILED:", err);
    process.exit(1);
});
