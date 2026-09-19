const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/jwt');

// Controlled fixed demo user IDs
const VALID_DEMO_IDS = new Set(['demo-buyer-id', 'demo-seller-id', 'demo-admin-id', 'demo-user-id']);

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Not authorized, token missing' });
            }

            // Cryptographically verify all tokens
            const decoded = jwt.verify(token, JWT_SECRET);

            const isDemoMode = process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';

            // Check if this is a controlled demo user token
            const isControlledDemo = Boolean(
                decoded.isDemo &&
                (VALID_DEMO_IDS.has(decoded.id) || (decoded.email && decoded.email.endsWith('@shopease.com')))
            );

            if (isControlledDemo) {
                if (!isDemoMode) {
                    return res.status(401).json({ message: 'Demo tokens are not permitted in production mode.' });
                }

                req.user = {
                    id: decoded.id || 'demo-user-id',
                    _id: decoded.id || 'demo-user-id',
                    name: decoded.name || 'Demo User',
                    email: decoded.email || `${decoded.role || 'user'}@shopease.com`,
                    role: decoded.role || 'buyer',
                    isDemo: true
                };
                return next();
            }

            // Real user verification
            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({
                    message: 'Database connection is currently unavailable. Authorization cannot be verified.'
                });
            }

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found or deactivated' });
            }

            return next();
        } catch (error) {
            console.error('Auth protect error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
