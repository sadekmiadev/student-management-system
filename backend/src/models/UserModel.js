const db = require('../config/db');

const UserModel = {
    findByEmailOrUsername: async (identifier) => {
        const sql = 'SELECT * FROM users WHERE email = ? OR username = ?';
        const [rows] = await db.query(sql, [identifier, identifier]);
        return rows[0];
    },

    create: async (userData) => {
        const sql = `
            INSERT INTO users 
            (username, first_name, last_name, email, phone_number, dob, gender, district, password, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userData.username,
            userData.first_name,
            userData.last_name,
            userData.email,
            userData.phone_number,
            userData.dob,
            userData.gender,
            userData.district,
            userData.password,
            userData.role || 'user'
        ];
        const [result] = await db.query(sql, values);
        return result.insertId;
    },

    findById: async (id) => {
        const sql = 'SELECT id, username, first_name, last_name, email, phone_number, dob, gender, district, role, created_at FROM users WHERE id = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    },

    findAll: async () => {
        const sql = 'SELECT id, username, first_name, last_name, email, phone_number, dob, gender, district, role, created_at FROM users';
        const [rows] = await db.query(sql);
        return rows;
    },

    updateRole: async (userId, newRole) => {
        const sql = 'UPDATE users SET role = ? WHERE id = ?';
        const [result] = await db.query(sql, [newRole, userId]);
        return result.affectedRows > 0;
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return false;

        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    }
};

module.exports = UserModel;