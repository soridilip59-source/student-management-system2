# Student Management System (SMS)

A comprehensive full-stack student management application built with the MERN stack (MongoDB, Express, React, Node.js). This system provides complete management of students, teachers, courses, attendance, exams, marks, reports, and audit logs.

## 🌟 Features

### Core Features
- **Authentication & Authorization**: Secure login/registration with JWT tokens
- **Student Management**: Add, edit, delete, and view student information
- **Teacher Management**: Manage teacher profiles and assignments
- **Course Management**: Create and manage courses with course details
- **Attendance Tracking**: Real-time attendance marking and tracking
- **Exam Management**: Schedule and manage exams with exam details
- **Marks Entry**: Enter and manage student marks for exams
- **Reporting**: Generate comprehensive student report cards
- **Audit Logging**: Track all system activities and changes
- **Notifications**: Real-time notifications for system events
- **Dashboard**: Role-based dashboards (Admin, Student, Teacher)
- **Role-Based Access Control (RBAC)**: Different features for Admin, Teachers, and Students

### Advanced Features
- Real-time data updates
- Comprehensive audit trails
- CSV export functionality
- Responsive UI with Tailwind CSS
- Error handling and validation
- Rate limiting for API security

## 📋 Project Structure

```
student-management-system/
├── backend/                    # Node.js/Express API
│   ├── config/                # Database configuration
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Custom middleware (auth, error handling, logging)
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions (grade calculator, seeding)
│   ├── app.js               # Express app setup
│   ├── server.js            # Server entry point
│   └── package.json         # Backend dependencies
│
└── frontend/                  # React/Vite application
    ├── src/
    │   ├── components/       # Reusable React components
    │   ├── context/          # React Context (Auth)
    │   ├── pages/            # Page components
    │   ├── services/         # API service (axios)
    │   ├── App.jsx          # Root component
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    ├── vite.config.js       # Vite configuration
    ├── tailwind.config.js   # Tailwind CSS configuration
    └── package.json         # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional - uses in-memory MongoDB by default)

### Installation & Running

#### 1. Clone/Extract the Project
```bash
cd "student management systyem"
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file (optional - defaults are provided)
# NODE_ENV=development
# PORT=5000
# MONGODB_URI=<your_mongodb_connection_string>
# JWT_SECRET=supersecret_sms_jwt_token_key_2026_antigravity
# JWT_EXPIRE=7d

# Start the backend server
npm run dev          # Development with hot reload
# OR
npm start            # Production mode

# Seed the database with demo data
npm run seed
```

The backend server will start on `http://localhost:5000`

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

### API Health Check
```bash
curl http://localhost:5000/api/health
```

## 🔐 Default Credentials

The system comes pre-seeded with demo data. Use these credentials to login:

### Admin Account
- **Email**: admin@sms.com
- **Password**: admin123

### Teacher Account
- **Email**: teacher@sms.com
- **Password**: teacher123

### Student Account
- **Email**: student@sms.com
- **Password**: student123

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout user

#### Students
- `GET /students` - List all students
- `POST /students` - Create new student
- `GET /students/:id` - Get student details
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### Teachers
- `GET /teachers` - List all teachers
- `POST /teachers` - Create new teacher
- `GET /teachers/:id` - Get teacher details
- `PUT /teachers/:id` - Update teacher
- `DELETE /teachers/:id` - Delete teacher

#### Courses
- `GET /courses` - List all courses
- `POST /courses` - Create new course
- `GET /courses/:id` - Get course details
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

#### Attendance
- `GET /attendance` - List attendance records
- `POST /attendance` - Create attendance record
- `GET /attendance/student/:studentId` - Get student attendance

#### Exams
- `GET /exams` - List all exams
- `POST /exams` - Create new exam
- `GET /exams/:id` - Get exam details
- `PUT /exams/:id` - Update exam
- `DELETE /exams/:id` - Delete exam

#### Marks
- `GET /marks` - List all marks
- `POST /marks` - Enter marks
- `GET /marks/student/:studentId` - Get student marks
- `GET /marks/exam/:examId` - Get exam marks

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/admin` - Admin dashboard data
- `GET /dashboard/teacher` - Teacher dashboard data
- `GET /dashboard/student` - Student dashboard data

#### Reports
- `GET /reports/cards` - Get report cards
- `GET /reports/export` - Export reports as CSV

#### Audit Logs
- `GET /audit-logs` - List all audit logs

#### Notifications
- `GET /notifications` - List all notifications
- `POST /notifications/:id/read` - Mark notification as read

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **API Documentation**: REST API
- **Security**: CORS, Rate Limiting, Input Validation
- **Logging**: Morgan, Custom Audit Logger

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Icons**: Lucide React
- **UI Components**: Custom components with Tailwind

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS configuration
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure error handling
- Audit logging for all operations
- Protected API routes with middleware

## 📊 Database Models

- **User**: User authentication and basic info
- **Student**: Student information and enrollment
- **Teacher**: Teacher information and assignments
- **Course**: Course details and metadata
- **Attendance**: Student attendance records
- **Exam**: Exam schedules and details
- **Marks**: Student marks and grades
- **Notification**: System notifications
- **AuditLog**: Comprehensive audit trail

## 🚀 Deployment

### Building for Production

#### Backend
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
```

The `dist/` folder will contain the production-ready frontend build.

### Using Docker (Optional)

See [Dockerfile](./Dockerfile) and [docker-compose.yml](./docker-compose.yml) for containerization.

```bash
docker-compose up --build
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=supersecret_sms_jwt_token_key_2026_antigravity
JWT_EXPIRE=7d
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📄 License

This project is provided as-is for educational purposes.

## 👨‍💻 Support

For issues or questions, please contact the development team.

## 🔄 Development Workflow

1. Backend runs on port 5000
2. Frontend runs on port 5173
3. API requests from frontend go to `http://localhost:5000/api`
4. Use `npm run dev` for development with hot reload
5. Database auto-seeds on first run with demo data

## 📈 Future Enhancements

- Email notifications
- SMS alerts
- Advanced analytics
- Mobile app
- Payment integration
- Scheduling optimization
- Machine learning for grade prediction

---

**Built with ❤️ using MERN Stack**
