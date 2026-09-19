const express = require('express');
const dotenv = require('dotenv');
const open = require('open');
const cors = require('cors');
const path = require('path');

// ✅ FIX 1: dotenv configuration
dotenv.config();

// ✅ DEBUG: URI Check
console.log("🔍 MONGO_URI Check:", process.env.MONGO_URI ? "Loaded ✅" : "Not Found ❌");

// Connect to Database
const connectDB = require('./config/db');
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const fs = require('fs');

const frontendDistPath = path.join(__dirname, 'frontend', 'dist');
const hasBuiltFrontend = fs.existsSync(frontendDistPath);

// 1. Primary REST API Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);

// 2. Direct API routes with dual support (API requests vs Browser Page Navigation)
const handleApiOrSpa = (apiRouter) => (req, res, next) => {
    const isApiRequest = req.method !== 'GET' || 
                         req.xhr || 
                         (req.headers.accept && req.headers.accept.includes('application/json')) || 
                         Boolean(req.headers.authorization);
    if (isApiRequest) {
        return apiRouter(req, res, next);
    }
    next();
};

app.use('/auth', authRoutes);
app.use('/products', handleApiOrSpa(productRoutes));
app.use('/cart', handleApiOrSpa(cartRoutes));
app.use('/orders', handleApiOrSpa(orderRoutes));
app.use('/payment', paymentRoutes);

// 3. Static Assets: Legacy MPA explicitly accessible under /legacy
app.use('/legacy', express.static(path.join(__dirname, 'public')));
app.use('/user', express.static(path.join(__dirname, 'public')));

// Serve modern React frontend assets
if (hasBuiltFrontend) {
    app.use(express.static(frontendDistPath));
    console.log("🚀 Serving Modern React Frontend from frontend/dist");
} else {
    app.use(express.static(path.join(__dirname, 'public')));
}

// 4. SPA Fallback: Serve React SPA index.html for all browser navigation
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/legacy')) {
        return next();
    }
    if (hasBuiltFrontend) {
        return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Callback function ke aage 'async' lagaya hai
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Browser open karne wala code
    try {
        await open(`http://localhost:${PORT}`);
        console.log("🖥️  Browser opened automatically!");
    } catch (err) {
        console.log("⚠️  Could not open browser automatically:", err.message);
    }
});
