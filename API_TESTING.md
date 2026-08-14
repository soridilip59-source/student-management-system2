# API Testing Guide

This guide helps you test and validate the Student Management System API.

## Prerequisites

- Backend running on `http://localhost:5000`
- Postman, curl, or Thunder Client (or use the examples below)
- Demo data seeded in database

## Health Check

### Verify Backend is Running

**Endpoint**: `GET /api/health`

```bash
curl http://localhost:5000/api/health
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Student Management System API is healthy and operational 🚀",
  "timestamp": "2026-08-14T10:30:00.000Z"
}
```

---

## Authentication Testing

### 1. Admin Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "admin@sms.com",
  "password": "admin123"
}
```

**curl Command**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sms.com",
    "password": "admin123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "Admin User",
    "email": "admin@sms.com",
    "role": "admin"
  }
}
```

**Save the token** for subsequent requests:
```bash
TOKEN="your_jwt_token_here"
```

### 2. Get Current User

**Endpoint**: `GET /api/auth/me`

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "Admin User",
    "email": "admin@sms.com",
    "role": "admin"
  }
}
```

---

## Student Management Testing

### 3. Get All Students

**Endpoint**: `GET /api/students`

```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@student.com",
      "rollNumber": "STU001",
      "class": "12A",
      "phone": "9876543210"
    }
    // ... more students
  ]
}
```

### 4. Create New Student

**Endpoint**: `POST /api/students`

```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@student.com",
    "rollNumber": "STU004",
    "class": "12B",
    "phone": "9876543211",
    "fatherName": "Mr. Smith",
    "motherName": "Mrs. Smith"
  }'
```

### 5. Get Single Student

**Endpoint**: `GET /api/students/:id`

```bash
curl -X GET http://localhost:5000/api/students/student_id \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Update Student

**Endpoint**: `PUT /api/students/:id`

```bash
curl -X PUT http://localhost:5000/api/students/student_id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Jane Doe",
    "phone": "9876543212"
  }'
```

### 7. Delete Student

**Endpoint**: `DELETE /api/students/:id`

```bash
curl -X DELETE http://localhost:5000/api/students/student_id \
  -H "Authorization: Bearer $TOKEN"
```

---

## Course Management Testing

### 8. Get All Courses

**Endpoint**: `GET /api/courses`

```bash
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Create New Course

**Endpoint**: `POST /api/courses`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Mathematics",
    "code": "MATH101",
    "credits": 4,
    "teacher": "teacher_id",
    "description": "Advanced Mathematics"
  }'
```

---

## Attendance Testing

### 10. Get Attendance Records

**Endpoint**: `GET /api/attendance`

```bash
curl -X GET http://localhost:5000/api/attendance \
  -H "Authorization: Bearer $TOKEN"
```

### 11. Mark Attendance

**Endpoint**: `POST /api/attendance`

```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "student": "student_id",
    "date": "2026-08-14",
    "status": "present",
    "subject": "Mathematics"
  }'
```

---

## Exam Testing

### 12. Get All Exams

**Endpoint**: `GET /api/exams`

```bash
curl -X GET http://localhost:5000/api/exams \
  -H "Authorization: Bearer $TOKEN"
```

### 13. Create New Exam

**Endpoint**: `POST /api/exams`

```bash
curl -X POST http://localhost:5000/api/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Mid Term",
    "subject": "Mathematics",
    "date": "2026-09-01",
    "totalMarks": 100,
    "duration": 120
  }'
```

---

## Marks Testing

### 14. Get All Marks

**Endpoint**: `GET /api/marks`

```bash
curl -X GET http://localhost:5000/api/marks \
  -H "Authorization: Bearer $TOKEN"
```

### 15. Enter Marks

**Endpoint**: `POST /api/marks`

```bash
curl -X POST http://localhost:5000/api/marks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "student": "student_id",
    "exam": "exam_id",
    "marks": 85,
    "comments": "Good performance"
  }'
```

---

## Dashboard Testing

### 16. Get Dashboard Statistics

**Endpoint**: `GET /api/dashboard/stats`

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "stats": {
    "totalStudents": 3,
    "totalTeachers": 1,
    "totalCourses": 2,
    "totalExams": 2
  }
}
```

---

## Reporting Testing

### 17. Get Report Cards

**Endpoint**: `GET /api/reports/cards`

```bash
curl -X GET http://localhost:5000/api/reports/cards \
  -H "Authorization: Bearer $TOKEN"
```

### 18. Export Report as CSV

**Endpoint**: `GET /api/reports/export`

```bash
curl -X GET http://localhost:5000/api/reports/export \
  -H "Authorization: Bearer $TOKEN" \
  -o report.csv
```

---

## Audit Logs Testing

### 19. Get Audit Logs

**Endpoint**: `GET /api/audit-logs`

```bash
curl -X GET http://localhost:5000/api/audit-logs \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notifications Testing

### 20. Get Notifications

**Endpoint**: `GET /api/notifications`

```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

### 21. Mark Notification as Read

**Endpoint**: `POST /api/notifications/:id/read`

```bash
curl -X POST http://localhost:5000/api/notifications/notification_id/read \
  -H "Authorization: Bearer $TOKEN"
```

---

## Using Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Create a new collection "Student Management System"
4. Add requests using the endpoints above
5. Set environment variable: `token` with your JWT token
6. Use `{{token}}` in Authorization headers

### Postman Environment Setup

Create environment variable:
```
{
  "token": "your_jwt_token_here",
  "base_url": "http://localhost:5000/api"
}
```

Then use in requests:
```
{{base_url}}/students
```

With Authorization header:
```
Authorization: Bearer {{token}}
```

---

## Common Test Scenarios

### Scenario 1: Admin Full Workflow
1. Login as admin
2. Create a new student
3. Create a new course
4. Create a new exam
5. Enter marks for student
6. Generate report
7. View audit logs

### Scenario 2: Teacher Workflow
1. Login as teacher
2. View assigned students
3. Mark attendance
4. Enter marks
5. View reports

### Scenario 3: Student Workflow
1. Login as student
2. View attendance
3. Check marks
4. Download report card

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "field": "error message"
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP
- Returns 429 Too Many Requests if exceeded

---

## Testing Tools

### Using curl (Command Line)
```bash
# Install curl (usually pre-installed)
curl --version

# Make API requests
curl -X GET http://localhost:5000/api/health
```

### Using Postman
- Download: [postman.com](https://www.postman.com)
- GUI interface for API testing
- Built-in environment management
- Mock servers and collections

### Using Thunder Client (VS Code)
- Extension for VS Code
- Lightweight Postman alternative
- Built-in VS Code integration

### Using httpie
```bash
# Install
pip install httpie

# Make requests
http GET http://localhost:5000/api/health
```

---

## Troubleshooting

### "Cannot GET /api/..."
- Backend server not running
- Check if server is on port 5000
- Check console for errors

### "401 Unauthorized"
- Token expired or invalid
- Need to login again
- Check token format in Authorization header

### "CORS Error"
- Backend CORS not configured
- Check backend CORS settings
- Frontend and backend on different ports is normal

### "Connection Refused"
- Backend server not running
- Port 5000 already in use
- Check firewall settings

---

## Next Steps

1. Test all endpoints using curl or Postman
2. Verify responses match expected formats
3. Test error scenarios
4. Load test with multiple requests
5. Test with different user roles

For more information, see [README.md](./README.md)
