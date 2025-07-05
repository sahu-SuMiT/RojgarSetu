const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const {generateStudentToken} = require('../controllers/authController');
const authMiddleware  = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');
const Student = require('../models/Student')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {emailTransport} = require('../config/email'); // Adjust this path as per your project structure


// Import your Mongoose models
const RegistrationOtp = require('../models/RegistrationOtp'); // Adjust this path


// Profile routes using /me (token-based auth)
router.get('/me', authMiddleware, studentController.getOwnProfile);
router.put('/me', authMiddleware, studentController.updateOwnProfile);
router.post('/me/profile-pic', authMiddleware, imageUpload.single('profilePic'), studentController.uploadProfilePic);
router.get('/me/profile-pic', authMiddleware, studentController.getProfilePic);

router.post('/register/initiate', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      referralCode // optional
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check for duplicate email or phone
    const existing = await Student.findOne({ $or: [ { email }, {phone} ] });
    if (existing) {
      return res.status(409).json({ error: 'Student with this email or phone already exists' });
    }
    
    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email
    await RegistrationOtp.deleteMany({ email: email, type: 'student' });

    // Store OTP and student info
    const registrationOtp = new RegistrationOtp({
      email: email,
      otp,
      expiresAt,
      type: 'student',
      data: {
        name,
        email,
        phone,
        referralCode
      }
    });
    await registrationOtp.save();
    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: `Hi ${name} Your Student Registration OTP`,
      text: `Your OTP for student registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Error initiating student registration:', err);
    res.status(500).json({ error: 'Failed to initiate registration', details: err.message });
  }
});

// Verify OTP and complete college registration
router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !password ) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }
    // Find the OTP entry
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'student' });
    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or registration session expired.' });
    }
    // Check if OTP is valid and not expired
    if (registrationOtp.expiresAt < new Date()) {
      // Delete the invalid/expired OTP to prevent further attempts
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Optional: Add password strength validation here if needed

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the college using stored info and hashed password
    const StudentInfo = registrationOtp.data; // Get college info from the generic data field
    const newStudent = new Student({
      ...StudentInfo,
      password: hashedPassword // Use the hashed password
    });

    await newStudent.save();
    newStudent.id=await Student.findOne({email}).select("_id").lean();
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
    
    const token = generateStudentToken(newStudent);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Prevent CSRF attacks
    });
    res.status(201).json({
      token,
      student: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email
      }
    });

  } catch (err) {
    console.error('Error verifying OTP and registering college:', err);
    res.status(500).json({ error: 'Some error occured!', details: err.message });
  }
});
module.exports = router;
 