const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'seller')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin or seller' });
    }
};

module.exports = { admin };
