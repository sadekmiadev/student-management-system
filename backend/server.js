const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Student Management API is Running!' });
});

const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});