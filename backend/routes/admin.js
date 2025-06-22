// Get All Admin/Employee Data (Protected route - for Employee Management)
router.get('/employees', verifyAdminToken, async (req, res) => {
  try {
    // Check if user has permission to view employees
    if (!req.adminPermissions.includes('Employee Management') && req.adminRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Employee Management access required.'
      });
    }

    // Fetch all admin/employee accounts
    const employees = await Admin.find({}).select('-password -resetPasswordToken -resetPasswordExpires');
    
    // Transform data to match frontend expectations
    const transformedEmployees = employees.map((emp, index) => ({
      id: index + 1, // Frontend expects numeric IDs
      username: emp.username,
      email: emp.email,
      role: emp.role,
      status: emp.status,
      permissions: emp.permissions,
      phone: emp.phone,
      profileImage: emp.profileImage,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }));

    res.json({
      success: true,
      employees: transformedEmployees
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update Admin Profile (Protected route)
router.put('/profile', verifyAdminToken, async (req, res) => {
  try {
    const { username, email, phone, currentPassword, newPassword } = req.body;
    const adminId = req.adminId;

    // Find the admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update basic information
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    // Handle password change if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      admin.password = newPassword;
    }

    // Save the updated admin
    await admin.save();

    // Return updated admin data (without password)
    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: admin.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload Profile Image (Protected route)
router.post('/upload-profile-image', verifyAdminToken, async (req, res) => {
  try {
    // For now, we'll return a placeholder URL
    // In a real implementation, you would:
    // 1. Use multer to handle file upload
    // 2. Save the file to cloud storage (AWS S3, Cloudinary, etc.)
    // 3. Return the actual image URL
    
    const adminId = req.adminId;
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // For demo purposes, we'll use a placeholder image URL
    // In production, this would be the actual uploaded image URL
    const imageUrl = `https://via.placeholder.com/150/3B82F6/FFFFFF?text=${admin.username?.charAt(0)?.toUpperCase() || 'A'}`;
    
    // Update admin's profile image
    admin.profileImage = imageUrl;
    await admin.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}); 