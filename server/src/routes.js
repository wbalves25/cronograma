const express = require('express');
const AdminController = require('./controllers/AdminController');
const StudentController = require('./controllers/StudentController');

const routes = express.Router();

// Admin Routes
routes.post('/admin/create-course', AdminController.createCourse);

// Student Routes
routes.post('/student/enroll', StudentController.enroll);
routes.post('/student/availability', StudentController.setAvailability);
routes.post('/student/generate-schedule', StudentController.generateSchedule);
routes.post('/student/recalculate', StudentController.recalculate);
routes.post('/student/complete-task', StudentController.completeTask);
routes.get('/student/tasks/:userId', StudentController.getTasks); // Helper to view tasks

module.exports = routes;
