require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const makeAdmin = async () => {
    await connectDB();
    // Apna email yahan likhein jis user ko admin banana hai
    const email = "anushri@gmail.com"; // <--- Change this to your email
    
    const user = await User.findOne({ email });
    if (user) {
        user.role = "admin";
        await user.save();
        console.log(`✅ Success! ${user.name} is now an Admin.`);
    } else {
        console.log("❌ User not found!");
    }
    process.exit();
};

makeAdmin();
