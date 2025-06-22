const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyAdminToken, requireAdmin, requirePermission } = require('../middleware/adminAuth');
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    // Check if admin is active
    if (admin.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact system administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id, 
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: admin.getPublicProfile()
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Admin Profile (Protected route)
router.get('/profile', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Dashboard Stats (Protected route - both admin and employee can access)
router.get('/dashboard-stats', verifyAdminToken, async (req, res) => {
  try {
    // Import models for stats
    const College = require('../models/College');
    const Company = require('../models/Company');
    const Student = require('../models/Student');
    const Employee = require('../models/Employee');
    const CollegeApplication = require('../models/CollegeApplication');
    const Job = require('../models/Job');
    const Internship = require('../models/Internship');

    // Get counts
    const stats = await Promise.all([
      College.countDocuments(),
      Company.countDocuments(),
      Student.countDocuments(),
      Employee.countDocuments(),
      CollegeApplication.countDocuments(),
      Job.countDocuments(),
      Internship.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        colleges: stats[0],
        companies: stats[1],
        students: stats[2],
        employees: stats[3],
        applications: stats[4],
        jobs: stats[5],
        internships: stats[6]
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin-only routes (require admin role)
router.get('/admin-only-stats', verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    // This route is only accessible by admin role
    res.json({
      success: true,
      message: 'Admin-only data accessed successfully',
      role: req.adminRole
    });
  } catch (error) {
    console.error('Admin-only stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Permission-based route example
router.get('/manage-colleges', verifyAdminToken, requirePermission('manage_colleges'), async (req, res) => {
  try {
    // This route requires 'manage_colleges' permission
    res.json({
      success: true,
      message: 'College management access granted',
      permission: 'manage_colleges'
    });
  } catch (error) {
    console.error('Manage colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 