const Student = require('../../models/Student');
const College = require('../../models/College');
const Company = require('../../models/Company');
const User = require('../../models/User'); 
const SupportTicket = require('../../models/SupportTicket'); // Assuming this model exists
const moment = require('moment'); // Ensure moment is installed and required

// GET all students
exports.getAllStudents = async (req, res) => {
  try {
    // Populate only the name field from College
    const students = await Student.find().populate('college', 'name');
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching students' });
  }
};

// GET all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find();
    res.status(200).json({ success: true, data: colleges });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching colleges' });
  }
};

// GET all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching companies' });
  }
};

// Get student count only
exports.getStudentCount = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching student count' });
  }
};

// Get college count only
exports.getCollegeCount = async (req, res) => {
  try {
    const count = await College.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching college count:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching college count' });
  }
};

// Get company count only
exports.getCompanyCount = async (req, res) => {
  try {
    const count = await Company.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching company count:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching company count' });
  }
};

// fetch details from user
exports.getUserDetails = async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select("-password"); // Exclude password field
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Group users by salesId
    const grouped = {};
    users.forEach(user => {
      const salesId = user.salesId || "Unassigned";
      if (!grouped[salesId]) grouped[salesId] = [];
      grouped[salesId].push(user);
    });

    // Add counts for each group
    const result = {};
    Object.entries(grouped).forEach(([salesId, groupUsers]) => {
      result[salesId] = {
        users: groupUsers,
        studentCount: groupUsers.filter(u => u.type === "Student").length,
        collegeCount: groupUsers.filter(u => u.type === "College").length,
        companyCount: groupUsers.filter(u => u.type === "Company").length,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error while fetching users" });
    next(error);
  }
};


exports.getRecentActivity = async (req, res) => {
  try {
    const oneDayAgo = moment().subtract(1, 'days').toDate();

    const recentStudents = await Student.find({ createdAt: { $gte: oneDayAgo } });
    const recentColleges = await College.find({ createdAt: { $gte: oneDayAgo } });
    const recentCompanies = await Company.find({ createdAt: { $gte: oneDayAgo } });
    const recentSupportTickets = await SupportTicket.find({ createdAt: { $gte: oneDayAgo } });

    res.status(200).json({
      success: true,
      students: recentStudents,
      colleges: recentColleges,
      companies: recentCompanies,
      supportTickets: recentSupportTickets,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity' });
  }
};