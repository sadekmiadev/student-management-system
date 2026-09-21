const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('district').notEmpty().withMessage('District is required'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('dob').notEmpty().withMessage('Date of birth is required')
];

const loginValidation = [
    body('identifier').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;