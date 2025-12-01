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

// Serve Static Files (Standard)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ FIX 2: Allow accessing static files via /user prefix as well
// Ye line "Cannot GET /user/cart.html" error ko solve karegi agar aap puraana link use karte hain
app.use('/user', express.static(path.join(__dirname, 'public'))); 

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/payment', require('./routes/paymentRoutes'));
app.use('/user', require('./routes/userRoutes'));  // New user routes for buyer dashboard

// Serve frontend fallback
app.get('/', (req, res) => {
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
