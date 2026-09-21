const express = require('express');
const { body, param } = require('express-validator');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

const router = express.Router();

const studentValidation = [
    body('name').notEmpty().withMessage('Student name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('course').notEmpty().withMessage('Course is required'),
    body('semester').notEmpty().withMessage('Semester is required')
];

const idValidation = [
    param('id').isInt().withMessage('Invalid student ID')
];

router.use(auth);

router.get('/export', studentController.exportCSV);
router.post('/', studentValidation, studentController.create);
router.get('/', studentController.getAll);
router.get('/:id', idValidation, studentController.getById);
router.put('/:id', [...idValidation, ...studentValidation], studentController.update);
router.delete('/:id', idValidation, studentController.delete);

module.exports = router;