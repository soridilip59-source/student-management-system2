# Quick Start Guide

Get your Student Management System up and running in minutes!

## Prerequisites
- Node.js (v16+)
- npm or yarn
- ~5 minutes

## 🚀 Installation

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 🔧 Running the Application

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
✅ Backend running on: `http://localhost:5000`

### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```
✅ Frontend running on: `http://localhost:5173`

## 📱 Access the Application

Open your browser and go to: **`http://localhost:5173`**

## 🔐 Login with Demo Credentials

Choose one of these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sms.com | admin123 |
| Teacher | teacher@sms.com | teacher123 |
| Student | student@sms.com | student123 |

## ✨ What You Can Do

### Admin Dashboard
- Manage students, teachers, courses
- View attendance records
- Create exams and enter marks
- Generate reports
- View audit logs

### Teacher Dashboard
- Mark attendance
- Enter student marks
- View class information
- Generate grade reports

### Student Dashboard
- View attendance
- Check marks and grades
- View exam schedules
- Download report cards

## 🐛 Troubleshooting

### Backend won't start?
```bash
cd backend
# Check if port 5000 is in use
lsof -i :5000
# Try a different port
PORT=5001 npm run dev
```

### Frontend won't start?
```bash
cd frontend
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Cannot connect to backend?
- Make sure backend is running on `http://localhost:5000`
- Check your internet connection
- Clear browser cache

## 📚 Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Review API documentation in [README.md](./README.md#-api-documentation)

## 🆘 Need Help?

1. Check the [README.md](./README.md)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check backend logs: `npm run dev`
4. Check browser console for frontend errors

---

🎉 You're all set! Enjoy using the Student Management System!
