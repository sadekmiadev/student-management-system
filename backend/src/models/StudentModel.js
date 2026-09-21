const db = require('../config/db');

const StudentModel = {
    create: async (studentData, userId) => {
        const sql = `
            INSERT INTO students 
            (name, email, phone, course, semester, gpa, status, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            studentData.name,
            studentData.email,
            studentData.phone,
            studentData.course,
            studentData.semester,
            studentData.gpa || null,
            studentData.status || 'Active',
            userId
        ];
        const [result] = await db.query(sql, values);
        return result.insertId;
    },

    findAll: async (userId, isAdmin = false) => {
        let sql = 'SELECT * FROM students';
        const values = [];

        if (!isAdmin) {
            sql += ' WHERE created_by = ?';
            values.push(userId);
        }

        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, values);
        return rows;
    },

    findById: async (id, userId, isAdmin = false) => {
        let sql = 'SELECT * FROM students WHERE id = ?';
        const values = [id];

        if (!isAdmin) {
            sql += ' AND created_by = ?';
            values.push(userId);
        }

        const [rows] = await db.query(sql, values);
        return rows[0];
    },

    update: async (id, studentData, userId, isAdmin = false) => {
        let sql = `
            UPDATE students 
            SET name = ?, email = ?, phone = ?, course = ?, semester = ?, gpa = ?, status = ?
            WHERE id = ?
        `;
        const values = [
            studentData.name,
            studentData.email,
            studentData.phone,
            studentData.course,
            studentData.semester,
            studentData.gpa || null,
            studentData.status || 'Active',
            id
        ];

        if (!isAdmin) {
            sql += ' AND created_by = ?';
            values.push(userId);
        }

        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    },

    delete: async (id, userId, isAdmin = false) => {
        let sql = 'DELETE FROM students WHERE id = ?';
        const values = [id];

        if (!isAdmin) {
            sql += ' AND created_by = ?';
            values.push(userId);
        }

        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    }
};

module.exports = StudentModel;