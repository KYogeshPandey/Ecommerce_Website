const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../config/jwt');

// Controlled fixed demo accounts for offline/demo development
const DEMO_ACCOUNTS = {
    'buyer@shopease.com': {
        id: 'demo-buyer-id',
        name: 'Demo Buyer',
        role: 'buyer'
    },
    'seller@shopease.com': {
        id: 'demo-seller-id',
        name: 'Demo Seller',
        role: 'seller'
    },
    'admin@shopease.com': {
        id: 'demo-admin-id',
        name: 'Demo Admin',
        role: 'admin'
    }
};

// Generate JWT with user ID, role, and optional isDemo flag
const generateToken = (id, role, name = '', isDemo = false) => {
    return jwt.sign({ id, role, name, isDemo }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Security fix: Reject public admin registration
    if (role === 'admin') {
        return res.status(403).json({ message: 'Admin registration is not permitted. Only buyer or seller accounts can be created.' });
    }

    if (role && !['buyer', 'seller'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be buyer or seller' });
    }

    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connection is currently unavailable. Please ensure MongoDB is running.' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'buyer'
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role, user.name, false),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    const isDemoMode = process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';
    const normalizedEmail = email.trim().toLowerCase();
    const demoAccount = DEMO_ACCOUNTS[normalizedEmail];

    // Controlled demo login when in DEMO_MODE
    if (isDemoMode && demoAccount) {
        const redirectUrl = (demoAccount.role === 'seller' || demoAccount.role === 'admin')
            ? '/admin/dashboard.html'
            : '/user/dashboard.html';

        return res.json({
            _id: demoAccount.id,
            name: demoAccount.name,
            email: normalizedEmail,
            role: demoAccount.role,
            token: generateToken(demoAccount.id, demoAccount.role, demoAccount.name, true),
            redirectUrl,
            isDemo: true
        });
    }

    // If MongoDB is offline outside DEMO_MODE or for non-demo credentials
    if (mongoose.connection.readyState !== 1) {
        if (isDemoMode) {
            return res.status(401).json({
                message: 'Invalid demo credentials. In offline demo mode, use the fixed demo profiles (buyer@shopease.com, seller@shopease.com, admin@shopease.com).'
            });
        }
        return res.status(503).json({
            message: 'Database connection is currently unavailable. Please ensure MongoDB is running.'
        });
    }

    try {
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Determine the redirect URL based on the user's role
            const redirectUrl = (user.role === 'seller' || user.role === 'admin') ? '/admin/dashboard.html' : '/user/dashboard.html';

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role, user.name, false),
                redirectUrl: redirectUrl
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user data
// @route   GET /auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is set by the 'protect' middleware
    res.status(200).json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
