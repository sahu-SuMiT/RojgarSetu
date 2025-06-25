const express = require('express');
const router = express.Router();
require('dotenv').config({path: '../.env'});
const { isCompanyAuthenticated } = require('../middleware/auth');
const RegistrationOtp = require('../models/RegistrationOtp');
const authController = require('../controllers/authController');


router.post('/student-signup', authController.signup_student);
router.post('/student-login', authController.login_student);

router.post('/college-admin', authController.login_college);

router.post('/company-admin', authController.login_company);

router.post('/register/check-otp', async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({ valid: false, error: 'Missing required fields: email, otp, and type.' });
    }

    // Find the OTP entry for the specific type
    const registrationOtp = await RegistrationOtp.findOne({ email, type });

    if (!registrationOtp) {
      return res.status(400).json({ valid: false, error: `Invalid email or ${type} registration session expired.` });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp === otp && registrationOtp.expiresAt > new Date()) {
      return res.json({ valid: true });
    } else if (registrationOtp.expiresAt < new Date()) {
      // Optionally delete expired OTP here
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ valid: false, error: 'OTP expired.' });
    } else {
      return res.status(400).json({ valid: false, error: 'Invalid OTP.' });
    }

  } catch (err) {
    console.error('Error checking OTP validity:', err);
    res.status(500).json({ valid: false, error: 'Failed to check OTP validity.', details: err.message });
  }
});
router.post('/logout', authController.logout_college_company);

// Add this test route
router.get('/verify-token', authController.check_token_exists);

router.get('/company/profile', isCompanyAuthenticated, authController.getCompanyorEmployeeProfile);

router.post('/company/forgot-password', authController.companyForgotPassword);

router.post('/company/reset-password/:token', authController.sendCompanyResetPasswordToken);

router.post('/college/forgot-password', authController.collegeForgotPassword);

router.post('/college/reset-password/:token', authController.sendCollegeResetPasswordToken);

router.post('/student/forgot-password', authController.studentForgotPassword);

router.post('/student/reset-password/:token', authController.sendStudentResetPasswordToken);

router.get('/check-bypass-auth', authController.checkBypassAuth); //or send them back to login page


module.exports = router;