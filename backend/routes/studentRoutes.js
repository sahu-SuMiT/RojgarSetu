const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

// Only allow the logged-in student to access/update their own profile
router.get('/:studentId', authMiddleware, studentController.getStudentProfile);
router.put('/:studentId', authMiddleware, studentController.updateStudentProfile);

module.exports = router;