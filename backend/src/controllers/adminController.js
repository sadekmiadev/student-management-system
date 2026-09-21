const UserModel = require('../models/UserModel');
const StudentModel = require('../models/StudentModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.findAll();

        res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await StudentModel.findAll(null, true);

        res.json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error('Get all students (admin) error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "admin" or "user"'
            });
        }

        if (id == req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        const updated = await UserModel.updateRole(id, role);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User role updated to ${role} successfully`
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

exports.deleteAnyStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await StudentModel.delete(id, null, true);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Admin delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};