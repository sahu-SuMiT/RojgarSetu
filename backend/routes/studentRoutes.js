const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Only allow the logged-in student to access/update their own profile
router.get('/:studentId', authMiddleware, studentController.getStudentProfile);
router.put('/:studentId', authMiddleware, studentController.updateStudentProfile);

// Profile picture upload endpoint (Buffer)
router.post('/:studentId/profile-pic', authMiddleware, upload.single('profilePic'), studentController.uploadProfilePic);

// Profile image URL set endpoint (OPTIONAL; allows setting an image URL directly)
router.post('/:studentId/profile-image-url', authMiddleware, studentController.setProfileImageUrl);

// Serve profile picture (Buffer or fallback to URL)
router.get('/:studentId/profile-pic', studentController.getProfilePic);

module.exports = router;