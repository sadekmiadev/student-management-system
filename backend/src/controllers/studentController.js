const { validationResult } = require('express-validator');
const StudentModel = require('../models/StudentModel');

exports.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const studentId = await StudentModel.create(req.body, req.user.id);

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            studentId
        });

    } catch (error) {
        console.error('Create student error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const students = await StudentModel.findAll(req.user.id, isAdmin);

        res.json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin';

        const student = await StudentModel.findById(id, req.user.id, isAdmin);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: student
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.update = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { id } = req.params;
        const isAdmin = req.user.role === 'admin';

        const updated = await StudentModel.update(id, req.body, req.user.id, isAdmin);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or you are not authorized'
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully'
        });

    } catch (error) {
        console.error('Update student error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin';

        const deleted = await StudentModel.delete(id, req.user.id, isAdmin);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or you are not authorized'
            });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.exportCSV = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const students = await StudentModel.findAll(req.user.id, isAdmin);

        let csv = 'Name,Email,Phone,Course,Semester,GPA,Status\n';
        students.forEach(s => {
            csv += `${s.name},${s.email},${s.phone},${s.course},${s.semester},${s.gpa || ''},${s.status}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};