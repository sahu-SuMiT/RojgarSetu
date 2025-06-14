const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware'); // ✅ Import multer config

// Get student profile
router.get('/:studentId', authMiddleware, studentController.getStudentProfile);

// Update student profile
router.put('/:studentId', authMiddleware, studentController.updateStudentProfile);

// Upload profile picture
router.post(
  '/:studentId/profile-pic',
  authMiddleware,
  imageUpload.single('profilePic'), // ✅ Use correct upload middleware
  studentController.uploadProfilePic
);

module.exports = router;