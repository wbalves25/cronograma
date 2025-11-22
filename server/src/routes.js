const express = require('express');
const AdminController = require('./controllers/AdminController');
const StudentController = require('./controllers/StudentController');
const AuthController = require('./controllers/AuthController');
const authMiddleware = require('./middlewares/auth');

const routes = express.Router();

// Auth Routes
routes.post('/auth/register', AuthController.register);
routes.post('/auth/login', AuthController.login);

// Admin Routes (Protected)
routes.post('/admin/create-course', authMiddleware, AdminController.createCourse);

// Student Routes (Protected)
routes.post('/student/enroll', authMiddleware, StudentController.enroll);
routes.post('/student/availability', authMiddleware, StudentController.setAvailability);
routes.post('/student/generate-schedule', authMiddleware, StudentController.generateSchedule);
routes.post('/student/recalculate', authMiddleware, StudentController.recalculate);
routes.post('/student/complete-task', authMiddleware, StudentController.completeTask);
routes.get('/student/tasks/:userId', authMiddleware, StudentController.getTasks);

module.exports = routes;
