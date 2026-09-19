const http = require('http');

const request = (options, data = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed });
                } catch {
                    resolve({ status: res.statusCode, headers: res.headers, raw: body });
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
};

async function runTests() {
    console.log('🧪 Starting Security Remediation Verification Tests...\n');
    let passed = 0;
    let total = 0;

    const assert = (condition, name, details = '') => {
        total++;
        if (condition) {
            passed++;
            console.log(`✅ [PASS] ${name}`);
        } else {
            console.error(`❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
        }
    };

    // 1. Mock token rejection
    try {
        const res = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders/my',
            method: 'GET',
            headers: { 'Authorization': 'Bearer mock-token-admin' }
        });
        assert(res.status === 401, 'Mock token mock-token-admin is strictly rejected with 401', `Status: ${res.status}`);
    } catch (e) {
        assert(false, 'Mock token rejection test failed', e.message);
    }

    // 2. Arbitrary admin email cannot get admin token offline
    try {
        const res = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'admin@attacker.com', password: 'anyPassword' });
        assert(res.status === 401, 'Arbitrary admin email admin@attacker.com rejected with 401', `Status: ${res.status}`);
    } catch (e) {
        assert(false, 'Arbitrary admin login test failed', e.message);
    }

    // 3. Public admin registration rejected with 403
    try {
        const res = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { name: 'Evil Admin', email: 'evil@test.com', password: 'password123', role: 'admin' });
        assert(res.status === 403, 'Public admin registration rejected with 403 Forbidden', `Status: ${res.status}`);
    } catch (e) {
        assert(false, 'Public admin registration test failed', e.message);
    }

    // 4. Controlled Demo Login for Buyer, Seller, Admin
    let buyerToken = '';
    let adminToken = '';
    try {
        const buyerRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'buyer@shopease.com', password: 'demoPassword123' });
        assert(buyerRes.status === 200 && buyerRes.data.role === 'buyer' && buyerRes.data.token, 'Controlled buyer demo login returns signed token');
        buyerToken = buyerRes.data.token;

        const sellerRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'seller@shopease.com', password: 'demoPassword123' });
        assert(sellerRes.status === 200 && sellerRes.data.role === 'seller' && sellerRes.data.token, 'Controlled seller demo login returns signed token');

        const adminRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'admin@shopease.com', password: 'demoPassword123' });
        assert(adminRes.status === 200 && adminRes.data.role === 'admin' && adminRes.data.token, 'Controlled admin demo login returns signed token');
        adminToken = adminRes.data.token;
    } catch (e) {
        assert(false, 'Controlled demo logins failed', e.message);
    }

    // 5. COD Checkout in demo mode
    let createdOrderId = '';
    try {
        const orderRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            }
        }, {
            shippingAddress: { name: 'Test Buyer', city: 'Test City', address: '123 Test St' },
            paymentMethod: 'COD',
            items: [{ productId: '1', quantity: 2, price: 14999 }]
        });
        assert(orderRes.status === 201 && orderRes.data._id && orderRes.data.paymentMethod === 'COD', 'COD checkout creates order in demo mode');
        createdOrderId = orderRes.data._id;
    } catch (e) {
        assert(false, 'COD checkout test failed', e.message);
    }

    // 6. Unknown order ID lookup returns 404 (not DEMO_ORDERS[0])
    try {
        const res = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders/ORD-NONEXISTENT-999999',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${buyerToken}` }
        });
        assert(res.status === 404, 'Unknown order ID lookup returns HTTP 404 (not DEMO_ORDERS[0])', `Status: ${res.status}`);
    } catch (e) {
        assert(false, 'Unknown order lookup test failed', e.message);
    }

    // 7. Unknown order status update returns 404
    try {
        const res = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders/ORD-NONEXISTENT-999999/status',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            }
        }, { status: 'Shipped' });
        assert(res.status === 404, 'Unknown order status update returns HTTP 404', `Status: ${res.status}`);
    } catch (e) {
        assert(false, 'Unknown order update test failed', e.message);
    }

    // 8. Payment amount validation: non-positive, NaN, or non-numeric rejected with 400
    try {
        const negRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/payment/create-order',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            }
        }, { amount: -500 });
        assert(negRes.status === 400, 'Negative payment amount rejected with HTTP 400', `Status: ${negRes.status}`);

        const nanRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/payment/create-order',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            }
        }, { amount: 'invalid-number' });
        assert(nanRes.status === 400, 'NaN payment amount rejected with HTTP 400', `Status: ${nanRes.status}`);
    } catch (e) {
        assert(false, 'Payment validation tests failed', e.message);
    }

    // 9. Razorpay missing credentials returns clean 503 JSON with positive amount
    try {
        const res = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/payment/create-order',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            }
        }, { amount: 1500 });
        assert(res.status === 503 && res.data.success === false, 'Razorpay missing credentials returns clean 503 JSON', `Status: ${res.status}`);
    } catch (e) {
        assert(false, 'Razorpay credentials test failed', e.message);
    }

    // 10. Regex safety: special characters in category / search
    try {
        const res1 = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/products?search=(a%2B)%2B%24',
            method: 'GET'
        });
        assert(res1.status === 200, 'Search query with ReDoS regex metacharacters does not throw 500', `Status: ${res1.status}`);

        const res2 = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/products?category=(unbalanced',
            method: 'GET'
        });
        assert(res2.status === 200, 'Category query with unbalanced regex does not throw 500', `Status: ${res2.status}`);
    } catch (e) {
        assert(false, 'Regex sanitization tests failed', e.message);
    }

    // 11. Demo order isolation: order placed by buyer is NOT leaked to new user
    try {
        const buyerOrdersRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders/my',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${buyerToken}` }
        });
        const hasOrder = buyerOrdersRes.data.some(o => o._id === createdOrderId);
        assert(hasOrder, 'Created order found in buyer order history');

        const sellerOrdersRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders/my',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const sellerHasBuyerOrder = sellerOrdersRes.data.some(o => o._id === createdOrderId);
        assert(!sellerHasBuyerOrder, 'Created order is isolated and NOT leaked to other users in myorders');
    } catch (e) {
        assert(false, 'Order isolation test failed', e.message);
    }

    console.log(`\n📊 Results: ${passed}/${total} assertions passed (${Math.round(passed/total * 100)}%)`);
}

runTests();
