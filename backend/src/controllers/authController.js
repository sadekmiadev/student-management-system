const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { username, email, phone_number, password } = req.body;

        const existingUser = await UserModel.findByEmailOrUsername(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email or username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await UserModel.create({
            ...req.body,
            password: hashedPassword
        });

        const token = generateToken(userId);
        const user = await UserModel.findById(userId);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { identifier, password } = req.body;
        const user = await UserModel.findByEmailOrUsername(identifier);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user.id);
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, email, password } = req.body;

        const updateData = {};
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (email) updateData.email = email;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await UserModel.update(userId, updateData);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await UserModel.findById(userId);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};