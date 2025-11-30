const express = require('express');
const dotenv = require('dotenv');
// Ensure karein ki aapne 'npm install open' run kiya hua hai
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
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/payment', require('./routes/paymentRoutes'));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// 👇 YAHAN CHANGE KIYA HAI 👇
// Callback function ke aage 'async' lagaya hai
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Browser open karne wala code ISKE ANDAR aayega
    try {
        await open(`http://localhost:${PORT}`);
        console.log("🖥️  Browser opened automatically!");
    } catch (err) {
        console.log("⚠️  Could not open browser automatically:", err.message);
    }
});
