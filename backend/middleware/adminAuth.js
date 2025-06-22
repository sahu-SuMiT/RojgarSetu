const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.status || admin.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated, contact system administrator'
      });
    }

    req.admin = admin;
    req.adminId = decoded.adminId;
    req.adminRole = decoded.role;
    req.adminPermissions = decoded.permissions;
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is admin (not employee)
const requireAdmin = (req, res, next) => {
  if (req.adminRole === 'admin') {
    return next();
  }
  res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};


module.exports = {
  verifyAdminToken,
  requireAdmin
};