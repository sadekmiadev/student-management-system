const express = require('express');
const { body, param } = require('express-validator');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/roleCheck');

const router = express.Router();

const roleValidation = [
    param('id').isInt().withMessage('Invalid user ID'),
    body('role').isIn(['admin', 'user']).withMessage('Role must be "admin" or "user"')
];

router.use(auth);
router.use(isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/students', adminController.getAllStudents);
router.put('/users/:id/role', roleValidation, adminController.updateUserRole);
router.delete('/students/:id', adminController.deleteAnyStudent);

module.exports = router;