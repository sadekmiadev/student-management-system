# Student Management System

A full-stack web application for managing students with authentication, CRUD operations, and admin features.

## Features

- User Registration and Login (JWT Authentication)
- Dashboard with Statistics (Total, Active, Inactive Students, Average GPA)
- Student CRUD Operations (Create, Read, Update, Delete)
- Admin Panel (View all students, Edit/Delete any student)
- Profile Update (Settings)
- Reports Export (CSV)
- Statistics Chart (Chart.js)
- Responsive Design

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Chart.js

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- mysql2

### Database
- MySQL

## Project Structure


Student-Management-System/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── models/
│ │ └── routes/
│ ├── .env
│ ├── package.json
│ └── server.js
└── frontend/
├── dashboard/
├── login/
├── register/
├── shared/
└── students/



## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/sadekmiadev/student-management-system.git
cd student-management-system


cd backend
npm install



PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_management
DB_PORT=3306
JWT_SECRET=your_secret_key


npm run dev



Open frontend/login/login.html with Live Server.

Default Admin Credentials
Email: admin@system.com

Password: admin123

Author
MD. Sadek Mia

GitHub: @sadekmiadev


## License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project for personal or commercial purposes, provided the original author is credited.

See the [LICENSE](LICENSE) file for more details.



