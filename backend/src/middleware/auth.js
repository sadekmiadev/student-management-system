const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

module.exports = auth;