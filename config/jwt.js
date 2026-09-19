const crypto = require('crypto');

let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: JWT_SECRET environment variable is required in production mode.');
    }
    // Generate a secure per-process random secret for local development/demo mode
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️ [Auth] No JWT_SECRET provided. Generated a secure per-process secret for development.');
}

module.exports = { JWT_SECRET };
