/**
 * Production Readiness Audit Script
 * Runs automated checks against a running server on port 5000
 */

const http = require('http');

function req(options, body = null) {
    return new Promise((resolve, reject) => {
        const r = http.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        r.on('error', reject);
        if (body) r.write(typeof body === 'string' ? body : JSON.stringify(body));
        r.end();
    });
}

const BASE = { hostname: 'localhost', port: 5000 };
const J = { 'Content-Type': 'application/json' };

const results = [];
let buyerToken, adminToken, createdOrderId;

function report(n, pass, detail = '') {
    const status = pass ? '✅ PASS' : '❌ FAIL';
    results.push({ n, pass, detail });
    console.log(`${status} [${n}] ${detail}`);
}

async function run() {
    console.log('\n=== PRODUCTION READINESS AUDIT ===\n');

    // ─── 1. Frontend Build ──────────────────────────────────────────────────
    const fs = require('fs');
    const path = require('path');
    const distExists = fs.existsSync(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
    report('1. Frontend Build', distExists, distExists ? 'frontend/dist/index.html exists' : 'frontend/dist/index.html MISSING');

    // ─── 2. Backend starts correctly ───────────────────────────────────────
    try {
        const ping = await req({ ...BASE, path: '/api/products', method: 'GET', headers: J });
        report('2. Backend starts', ping.status === 200, `GET /api/products → ${ping.status}`);
    } catch (e) {
        report('2. Backend starts', false, `Cannot reach localhost:5000 — ${e.message}`);
        console.error('Cannot proceed with live tests. Exiting.');
        process.exit(1);
    }

    // ─── 3. Production mode refuses start w/o MONGO_URI ────────────────────
    // Tested offline via test_db_config.js — confirm here via env check
    const hasCheck = fs.readFileSync(path.join(__dirname, '..', 'config', 'db.js'), 'utf8')
        .includes("if (isProduction && !primaryURI)");
    report('3. Prod mode requires MONGO_URI', hasCheck,
        hasCheck ? 'config/db.js has isProduction+!primaryURI guard' : 'Guard code NOT FOUND in config/db.js');

    // ─── 4. Dev/Demo mode works without MongoDB ─────────────────────────────
    const products = await req({ ...BASE, path: '/api/products', method: 'GET', headers: J });
    const isDemo = Array.isArray(products.body) && products.body.length > 0;
    report('4. Dev/Demo mode (no MongoDB)', isDemo,
        isDemo ? `Got ${products.body.length} fallback products` : `Unexpected response: ${JSON.stringify(products.body).slice(0, 100)}`);

    // ─── 5. Demo buyer login ────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/auth/login', method: 'POST', headers: J },
            { email: 'buyer@shopease.com', password: 'any' });
        const ok = r.status === 200 && r.body.token && r.body.role === 'buyer' && r.body.isDemo === true;
        buyerToken = r.body.token;
        report('5. Demo buyer login', ok, ok ? `token received, role=buyer, isDemo=true` : `status=${r.status} body=${JSON.stringify(r.body).slice(0,120)}`);
    } catch (e) {
        report('5. Demo buyer login', false, e.message);
    }

    // ─── 6. Demo admin login ────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/auth/login', method: 'POST', headers: J },
            { email: 'admin@shopease.com', password: 'any' });
        const ok = r.status === 200 && r.body.token && r.body.role === 'admin' && r.body.isDemo === true;
        adminToken = r.body.token;
        report('6. Demo admin login', ok, ok ? `token received, role=admin, isDemo=true` : `status=${r.status} body=${JSON.stringify(r.body).slice(0,120)}`);
    } catch (e) {
        report('6. Demo admin login', false, e.message);
    }

    const authB = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` };
    const authA = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };

    // ─── 7a. Product listing ────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/products', method: 'GET', headers: J });
        report('7a. Product listing', r.status === 200 && Array.isArray(r.body) && r.body.length > 0,
            `${r.body.length || 0} products returned`);
    } catch(e) { report('7a. Product listing', false, e.message); }

    // ─── 7b. Product search ─────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/products?search=headphones', method: 'GET', headers: J });
        const ok = r.status === 200 && Array.isArray(r.body) && r.body.length > 0;
        report('7b. Product search', ok, ok ? `search=headphones → ${r.body.length} result(s)` : `status=${r.status}`);
    } catch(e) { report('7b. Product search', false, e.message); }

    // ─── 7c. Product filter by category ────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/products?category=Electronics', method: 'GET', headers: J });
        const ok = r.status === 200 && Array.isArray(r.body) && r.body.length > 0;
        report('7c. Product filter (category)', ok, ok ? `category=Electronics → ${r.body.length} result(s)` : `status=${r.status}`);
    } catch(e) { report('7c. Product filter (category)', false, e.message); }

    // ─── 7d. Product sorting ────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/products?sort=oldest', method: 'GET', headers: J });
        let sortOk = r.status === 200 && Array.isArray(r.body) && r.body.length > 1;
        if (sortOk) {
            for (let i = 0; i < r.body.length - 1; i++) {
                if (new Date(r.body[i].createdAt) > new Date(r.body[i+1].createdAt)) { sortOk = false; break; }
            }
        }
        report('7d. Product sorting (oldest)', sortOk, sortOk ? `sort=oldest verified ascending` : `sort order incorrect`);
    } catch(e) { report('7d. Product sorting', false, e.message); }

    // ─── 7e. Product price filter ───────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/products?minPrice=2000&maxPrice=6000', method: 'GET', headers: J });
        const ok = r.status === 200 && Array.isArray(r.body) && r.body.every(p => p.price >= 2000 && p.price <= 6000);
        report('7e. Product price filter', ok, ok ? `minPrice=2000&maxPrice=6000 → ${r.body.length} result(s)` : `price filter invalid, status=${r.status}`);
    } catch(e) { report('7e. Product price filter', false, e.message); }

    // ─── 7f. ReDoS safety ──────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/products?search=%5B%5E%5D%2B%2B%26', method: 'GET', headers: J });
        report('7f. Search ReDoS safety', r.status !== 500, `status=${r.status} (not 500)`);
    } catch(e) { report('7f. Search ReDoS safety', false, e.message); }

    // Get fallback product id for cart tests
    const firstProductId = products.body?.[0]?._id;
    const firstProduct = products.body?.[0];

    // ─── 8a. Cart add ───────────────────────────────────────────────────────
    if (buyerToken && firstProductId) {
        try {
            const r = await req({ ...BASE, path: '/api/cart/add', method: 'POST', headers: authB },
                { productId: firstProductId, quantity: 2 });
            const ok = r.status === 200 && Array.isArray(r.body.products) && r.body.products.length > 0;
            report('8a. Cart add item', ok, ok ? `added productId=${firstProductId}, qty=2` : `status=${r.status} body=${JSON.stringify(r.body).slice(0,100)}`);
        } catch(e) { report('8a. Cart add item', false, e.message); }

        // ─── 8b. Cart update ────────────────────────────────────────────────
        try {
            const r = await req({ ...BASE, path: '/api/cart/update', method: 'POST', headers: authB },
                { productId: firstProductId, quantity: 3 });
            const ok = r.status === 200 && r.body.products?.some(p => String(p.product?._id || p.product) === String(firstProductId) && p.quantity === 3);
            report('8b. Cart update quantity', ok, ok ? `updated qty to 3` : `status=${r.status}`);
        } catch(e) { report('8b. Cart update quantity', false, e.message); }

        // ─── 8c. Cart invalid quantity ──────────────────────────────────────
        try {
            const r = await req({ ...BASE, path: '/api/cart/add', method: 'POST', headers: authB },
                { productId: firstProductId, quantity: 1.5 });
            report('8c. Cart rejects fractional qty', r.status === 400, `status=${r.status}`);
        } catch(e) { report('8c. Cart rejects fractional qty', false, e.message); }

        // ─── 8d. Cart remove ────────────────────────────────────────────────
        try {
            const r = await req({ ...BASE, path: `/api/cart/remove/${firstProductId}`, method: 'DELETE', headers: authB });
            const removed = r.status === 200 && !r.body.products?.some(p => String(p.product?._id || p.product) === String(firstProductId));
            report('8d. Cart remove item', removed, removed ? `item removed` : `status=${r.status}`);
        } catch(e) { report('8d. Cart remove item', false, e.message); }

        // Re-add for checkout test
        await req({ ...BASE, path: '/api/cart/add', method: 'POST', headers: authB },
            { productId: firstProductId, quantity: 1 });
    } else {
        report('8a. Cart add item', false, 'No buyer token or product ID available');
        report('8b. Cart update quantity', false, 'Skipped');
        report('8c. Cart rejects fractional qty', false, 'Skipped');
        report('8d. Cart remove item', false, 'Skipped');
    }

    // ─── 9. COD Checkout ────────────────────────────────────────────────────
    if (buyerToken && firstProduct) {
        try {
            const r = await req({ ...BASE, path: '/api/orders', method: 'POST', headers: authB }, {
                shippingAddress: { name: 'Test User', address: '123 Demo St', city: 'Demo City', state: 'Demo State', pinCode: '110001', phone: '9999999999' },
                paymentMethod: 'COD',
                items: [{ productId: firstProductId, quantity: 1, price: firstProduct.price || 999 }]
            });
            const ok = r.status === 201 && r.body._id && r.body.paymentMethod === 'COD';
            createdOrderId = r.body._id;
            report('9. COD checkout', ok, ok ? `orderId=${createdOrderId}` : `status=${r.status} body=${JSON.stringify(r.body).slice(0,120)}`);
        } catch(e) { report('9. COD checkout', false, e.message); }
    } else {
        report('9. COD checkout', false, 'No buyer token or product available');
    }

    // ─── 10a. Order history (my orders) ─────────────────────────────────────
    if (buyerToken) {
        try {
            const r = await req({ ...BASE, path: '/api/orders/my', method: 'GET', headers: authB });
            const ok = r.status === 200 && Array.isArray(r.body) && r.body.length > 0;
            report('10a. Order history (buyer)', ok, ok ? `${r.body.length} order(s) returned` : `status=${r.status}`);

            // ── 10b. Specific order retrieval ───────────────────────────────
            if (createdOrderId) {
                const r2 = await req({ ...BASE, path: `/api/orders/${createdOrderId}`, method: 'GET', headers: authB });
                report('10b. Order by ID', r2.status === 200 && r2.body._id === createdOrderId,
                    `GET /api/orders/${createdOrderId} → ${r2.status}`);
            } else {
                report('10b. Order by ID', false, 'No createdOrderId available');
            }
        } catch(e) {
            report('10a. Order history (buyer)', false, e.message);
            report('10b. Order by ID', false, 'Skipped');
        }
    } else {
        report('10a. Order history (buyer)', false, 'No buyer token');
        report('10b. Order by ID', false, 'Skipped');
    }

    // ─── 11a. Admin order list ───────────────────────────────────────────────
    if (adminToken) {
        try {
            const r = await req({ ...BASE, path: '/api/orders/admin', method: 'GET', headers: authA });
            report('11a. Admin order list', r.status === 200 && Array.isArray(r.body),
                `status=${r.status}, ${r.body?.length || 0} orders`);
        } catch(e) { report('11a. Admin order list', false, e.message); }

        // ─── 11b. Admin update order status ─────────────────────────────────
        if (createdOrderId) {
            try {
                const r = await req({ ...BASE, path: `/api/orders/${createdOrderId}/status`, method: 'PUT', headers: authA },
                    { status: 'Shipped' });
                const ok = r.status === 200 && (r.body.status === 'Shipped' || r.body.orderStatus === 'Shipped');
                report('11b. Admin update order status', ok, ok ? `orderId=${createdOrderId} → Shipped` : `status=${r.status} body=${JSON.stringify(r.body).slice(0,100)}`);
            } catch(e) { report('11b. Admin update order status', false, e.message); }
        } else {
            report('11b. Admin update order status', false, 'No createdOrderId');
        }

        // ─── 11c. Admin rejects invalid status ──────────────────────────────
        if (createdOrderId) {
            try {
                const r = await req({ ...BASE, path: `/api/orders/${createdOrderId}/status`, method: 'PUT', headers: authA },
                    { status: 'InvalidStatus' });
                report('11c. Admin rejects invalid status', r.status === 400, `status=${r.status}`);
            } catch(e) { report('11c. Admin rejects invalid status', false, e.message); }
        } else {
            report('11c. Admin rejects invalid status', false, 'No createdOrderId');
        }
    } else {
        report('11a. Admin order list', false, 'No admin token');
        report('11b. Admin update order status', false, 'Skipped');
        report('11c. Admin rejects invalid status', false, 'Skipped');
    }

    // ─── 12. Logout (client-side; JWT is stateless — verify /api/cart rejects expired/no token) ──
    try {
        const r = await req({ ...BASE, path: '/api/cart', method: 'GET', headers: { ...J, 'Authorization': 'Bearer invalid.token.here' } });
        report('12. Logout (invalid token rejected)', r.status === 401, `status=${r.status}`);
    } catch(e) { report('12. Logout (invalid token rejected)', false, e.message); }

    // ─── Security: Mock token rejected ──────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/orders/my', method: 'GET', headers: { ...J, 'Authorization': 'Bearer mock-token-admin' } });
        report('Security: mock-token-admin rejected', r.status === 401, `status=${r.status}`);
    } catch(e) { report('Security: mock-token-admin rejected', false, e.message); }

    // ─── Razorpay unconfigured returns 503 ─────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/api/payment/create-order', method: 'POST', headers: authB },
            { amount: 999 });
        report('Razorpay unconfigured → 503', r.status === 503 || r.status === 400,
            `status=${r.status} (503=unconfigured, 400=missing creds)`);
    } catch(e) { report('Razorpay unconfigured → 503', false, e.message); }

    // ─── Frontend HTML Served ────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/', method: 'GET', headers: { 'Accept': 'text/html' } });
        const ok = r.status === 200 && (typeof r.body === 'string' ? r.body.includes('<!DOCTYPE html') || r.body.includes('<html') : false);
        report('Frontend HTML served at /', ok, `status=${r.status}`);
    } catch(e) { report('Frontend HTML served at /', false, e.message); }

    // ─── SPA Fallback ───────────────────────────────────────────────────────
    try {
        const r = await req({ ...BASE, path: '/products', method: 'GET', headers: { 'Accept': 'text/html' } });
        const ok = r.status === 200;
        report('SPA fallback /products', ok, `status=${r.status}`);
    } catch(e) { report('SPA fallback /products', false, e.message); }

    // ─── Summary ────────────────────────────────────────────────────────────
    console.log('\n=== AUDIT SUMMARY ===');
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass);
    console.log(`\n✅ PASSED: ${passed}/${results.length}`);
    if (failed.length) {
        console.log(`\n❌ FAILED (${failed.length}):`);
        failed.forEach(r => console.log(`  - [${r.n}]: ${r.detail}`));
    } else {
        console.log('No failures!');
    }
    console.log('');
}

run().catch(err => { console.error('Audit error:', err); process.exit(1); });
