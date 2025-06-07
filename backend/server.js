require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');

// Import route modules
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

// College and Company models
const CollegeStudent = require('./models/CollegeStudent.model');
const Role = require('./models/Role');
const Company = require('./models/Company');
const Application = require('./models/Application');
const College = require('./models/College');
const Employee = require('./models/Employee');
const bcrypt = require('bcrypt');
const RegistrationOtp = require('./models/RegistrationOtp');
const Job = require('./models/Job');
const Internship = require('./models/Internship');
const Interview = require('./models/Interview');
const Review = require('./models/Review');
require('dotenv').config;
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();

// Configure CORS
const whitelist = [
  process.env.REACT_URL,
  'https://campusconnect-sumit-sahus-projects-83ef9bf1.vercel.app',
  'https://campusconnect-git-main-sumit-sahus-projects-83ef9bf1.vercel.app',
  'https://campusconnect-dk9xkuzk0-sumit-sahus-projects-83ef9bf1.vercel.app'
];
console.log("element in CORS whitelist:");
for(element of whitelist){
  console.log(element);
}

// Configure email transport
const emailTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASS
  }
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed from this origin'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  const formattedDate = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  console.log(`Connected to Database: ${process.env.MONGODB_URI} | ${formattedDate}`);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit process if DB connection fails
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('MongoDB connection established successfully');
});

// Routers
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/interviews', require('./routes/interviews'));

// REST API Endpoints

// College Students API
// Get a single student by ID
app.get('/api/student/:id', async (req, res) => {
  try {
    console.log('Fetching student with ID:', req.params.id);
    
    const student = await CollegeStudent.findById(req.params.id);
    
    if (!student) {
      console.log('Student not found');
      return res.status(404).json({ error: 'Student not found' });
    }
    
    console.log('Student found:', student);
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single student by ID and college
app.get('/api/college/:collegeId/student/:studentId', async (req, res) => {
  try {
    console.log('Fetching student with ID:', req.params.studentId);
    console.log('College ID:', req.params.collegeId);
    
    const student = await CollegeStudent.findOne({
      _id: req.params.studentId,
      college: req.params.collegeId
    });
    
    if (!student) {
      console.log('Student not found');
      return res.status(404).json({ error: 'Student not found' });
    }
    
    console.log('Student found:', student);
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all students for a college
app.get('/api/college-students/college/:collegeId', async (req, res) => {
  try {
    const students = await CollegeStudent.find({ college: req.params.collegeId });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk create students for a college
app.post('/api/college-students/bulk', async (req, res) => {
  try {
    const students = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Invalid request: students must be a non-empty array' });
    }

    // Validate each student object
    for (const student of students) {
      if (!student.name || !student.email || !student.rollNumber || !student.department || 
          !student.batch || !student.joiningYear || !student.graduationYear || !student.cgpa) {
        return res.status(400).json({ 
          error: 'Missing required fields for student',
          student: student
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email)) {
        return res.status(400).json({ 
          error: 'Invalid email format',
          student: student
        });
      }

      // Validate CGPA range
      if (student.cgpa < 0 || student.cgpa > 10) {
        return res.status(400).json({ 
          error: 'CGPA must be between 0 and 10',
          student: student
        });
      }
    }

    // Check for duplicate emails or roll numbers
    const emails = students.map(s => s.email);
    const rollNumbers = students.map(s => s.rollNumber);
    
    const existingStudents = await CollegeStudent.find({
      $or: [
        { email: { $in: emails } },
        { rollNumber: { $in: rollNumbers } }
      ]
    });

    if (existingStudents.length > 0) {
      return res.status(409).json({ 
        error: 'Some students already exist',
        existingStudents: existingStudents.map(s => ({
          email: s.email,
          rollNumber: s.rollNumber
        }))
      });
    }

    // Create all students
    const createdStudents = await CollegeStudent.insertMany(students);
    res.status(201).json(createdStudents);
  } catch (err) {
    console.error('Error creating students:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get student details
app.get('/api/students/:id', async (req, res) => {
  try {
    console.log('Fetching student details for ID:', req.params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    const student = await CollegeStudent.findById(req.params.id)
      .select('-password')
      .populate('department', 'name')
      .populate('batch', 'name')
      .lean();

    if (!student) {
      console.log('Student not found:', req.params.id);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Found student:', student.name);

    // Fetch jobs
    const jobs = await Job.find({ studentId: req.params.id })
      .sort({ startDate: -1 })
      .lean();

    // Fetch internships
    const internships = await Internship.find({ studentId: req.params.id })
      .sort({ startDate: -1 })
      .lean();

    // Fetch interviews
    const interviews = await Interview.find({ interviewee: req.params.id })
      .populate('companyId', 'name')
      .sort({ date: -1 })
      .lean();

    // Fetch reviews
    const reviews = await Review.find({ studentId: req.params.id })
      .populate('reviewer', 'name')
      .sort({ date: -1 })
      .lean();

    // Combine all data
    const studentDetails = {
      ...student,
      jobs,
      internships,
      interviews,
      reviews
    };

    console.log('Successfully fetched all student details');
    res.json(studentDetails);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ 
      message: 'Error fetching student details',
      error: error.message 
    });
  }
});


// Add PUT endpoint for updating college student profiles
app.put('/api/college/:collegeId/student/:studentId', async (req, res) => {
  try {
    console.log('Updating student with ID:', req.params.studentId);
    console.log('Update data:', req.body);
    
    const student = await CollegeStudent.findOneAndUpdate(
      {
        _id: req.params.studentId,
        college: req.params.collegeId
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!student) {
      console.log('Student not found for update');
      return res.status(404).json({ error: 'Student not found' });
    }
    
    console.log('Student updated successfully:', student);
    res.json(student);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('companyId', 'name')
      .sort({ createdAt: -1 }); 
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/company/:companyId/roles', async (req, res) => {
  try {
    const roles = await Role.find({ companyId: req.params.companyId })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 }); 
    res.json(roles);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add POST endpoint for creating a new role
app.post('/api/company/:companyId/roles', async (req, res) => {
  try {
    console.log(req.body)
    const {companyId} = req.params;
    var role = {...req.body,companyId:companyId.toString()};
    role = new Role(role);
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add PUT endpoint for updating a role
app.put('/api/roles/:id', async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add DELETE endpoint for removing a role
app.delete('/api/roles/:id', async (req, res) => {
  try {
    console.log('Attempting to delete role with ID:', req.params.id);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid role ID format');
      return res.status(400).json({ error: 'Invalid role ID format' });
    }
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      console.log('Role not found for deletion');
      return res.status(404).json({ error: 'Role not found' });
    }
    console.log('Role deleted successfully:', deletedRole);
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Error deleting role:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
});

// Application routes
app.post('/api/applications', async (req, res) => {
  try {
    
    const { applicationFromCollege, applicationToCompany, roleId, students } = req.body;
    
    if (!applicationFromCollege || !applicationToCompany || !roleId || !students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const application = new Application({
      ...req.body
    });
    
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Error creating application' });
  }
});

// Get applications for a college
app.get('/api/college/:collegeId/applications', async (req, res) => {
  try {
    const applications = await Application.find({ applicationFromCollege: req.params.collegeId })
      .populate('applicationToCompany', 'name')
      .populate('roleId', 'jobTitle')
      .populate('students.studentId', 'name email rollNumber cgpa batch skills');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get applications for a company
app.get('/api/company/:companyId/applications', async (req, res) => {
  try {
    const applications = await Application.find({ applicationToCompany: req.params.companyId, status:"active" })
      .populate('applicationFromCollege', 'name')
      .populate('roleId', 'jobTitle')
      .populate('students.studentId', 'name email rollNumber cgpa batch skills')
      .select('status applicationFromCollege applicationToCompany roleId students createdAt updatedAt');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update student application status
app.patch('/api/applications/:applicationId/students/:studentId/status', async (req, res) => {
  try {
    const { applicationId, studentId } = req.params;
    const { status, interviewDate, interviewLink } = req.body;

    if (!['pending', 'accepted', 'rejected', 'interview-scheduled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const studentIndex = application.students.findIndex(s => s.id.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in application' });
    }

    application.students[studentIndex].status = status;
    if (status === 'interview-scheduled') {
      if (!interviewDate) {
        return res.status(400).json({ message: 'Interview date is required for interview-scheduled status' });
      }
      application.students[studentIndex].interviewDate = interviewDate;
      application.students[studentIndex].interviewLink = interviewLink;
    }

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Update application status
app.patch('/api/applications/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Delete application
app.delete('/api/applications/:applicationId', async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error deleting application' });
  }
});

// Company-specific routes
app.post('/api/company/auth', async (req, res) => {
  const { email, password } = req.body;
  try {
    const company = await Company.findOne({ contactEmail: email });
    if (!company || password !== company.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({
      _id: company._id,
      name: company.name,
      email: company.contactEmail,
      role: 'company_admin'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying credentials' });
  }
});
app.get('/api/company/:companyId', async (req, res) => {
  try { 
    const company = await Company.findById(req.params.companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});
app.get('/api/company/applications/:companyId', async (req, res) => {
  try {
    const applications = await Application.find({ applicationTo: req.params.companyId })
      .populate('applicationFrom', 'name')
      .populate('roleId', 'jobTitle')
      .populate('studentIds', 'name email');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.patch('/api/company/applications/:applicationId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

app.delete('/api/company/applications/:applicationId', async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

app.get('/api/company/roles', async (req, res) => {
  try {
    const roles = await Role.find().populate('companyId', 'name').sort({ createdAt: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/company/roles', async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/company/roles/:id', async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/company/roles/:id', async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get college by ID
app.get('/api/colleges/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ error: 'Failed to fetch college details' });
  }
});

// Get all colleges
app.get('/api/colleges', async (req, res) => {
  try {
    console.log('Fetching all colleges...');
    const colleges = await College.find().sort({ name: 1 });
    console.log('Colleges found:', colleges.length);
    if (colleges.length === 0) {
      console.log('No colleges found in the database');
    }
    res.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ 
      error: 'Failed to fetch colleges',
      details: error.message 
    });
  }
});

// Get college by email
app.get('/api/colleges/email/:email', async (req, res) => {
  try {
    console.log('Finding college by email:', req.params.email);
    const college = await College.findOne({ contactEmail: req.params.email });
    if (!college) {
      console.log('College not found');
      return res.status(404).json({ error: 'College not found' });
    }
    console.log('College found:', college.name);
    res.json(college);
  } catch (error) {
    console.error('Error finding college:', error);
    res.status(500).json({ error: 'Failed to find college' });
  }
});

// Verify college admin credentials
app.post('/api/auth/college-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Verifying college admin:', email);
    

    const college = await College.findOne({ contactEmail: email });
    if (!college) {
      console.log('College not found');
      return res.status(404).json({ error: 'College not found' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, college.password);
    if(!isMatch)
      isMatch = (password.includes(college.password))
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('College admin verified successfully');
    const { password: pw, ...collegeData } = college.toObject();
    res.json({
      ...collegeData,
      role: 'college_admin',
      collegeId: college._id
    });
  } catch (error) {
    console.error('Error verifying college admin:', error);
    res.status(500).json({ error: 'Error verifying credentials' });
  }
});

// Verify company admin credentials (supports both company and employee login)
app.post('/api/auth/company-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Verifying company admin or employee:', email);
   
    // First try to find an employee with admin type
    const employee = await Employee.findOne({ 
      email: email, // Only allow admin type employees
    });

    if (employee) {
      // Employee login flow
      console.log('Found admin employee, verifying credentials');
      
      // Compare hashed password
      var isMatch = await bcrypt.compare(password, employee.password);
      if(!isMatch){
        isMatch = (password === employee.password)
      }
      if (!isMatch) {
        console.log('Invalid employee password');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get company details
      const company = await Company.findById(employee.companyId);
    if (!company) {
        console.log('Company not found for employee');
      return res.status(404).json({ error: 'Company not found' });
    }

      console.log('Company admin (employee) verified successfully');
      return res.json({
        _id: company._id,
        name: company.name,
        email: company.contactEmail,
        role: employee.type,
        employeeId: employee._id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        employeeType: employee.type,
        loginType: 'employee'
      });
    }

    // If no employee found, try company login
    console.log('No admin employee found, trying company login');
    const company = await Company.findOne({ contactEmail: email });
    if (!company) {
      console.log('Company not found');
      return res.status(404).json({ error: 'Invalid credentials' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, company.password);
    if(!isMatch){
      isMatch = (password === company.password)
    }
    if (!isMatch) {
      console.log('Invalid company password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Company admin (direct) verified successfully');
    res.json({
      _id: company._id,
      name: company.name,
      email: company.contactEmail,
      role: 'company_admin',
      loginType: 'company'
    });
  } catch (error) {
    console.error('Error verifying company admin:', error);
    res.status(500).json({ error: 'Error verifying credentials' });
  }
});

// Employee routes
app.post('/api/employees/register', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee' });
  }
});

app.post('/api/employee/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  try {
    const employee = await Employee.findOne({ email });
    if (!employee || employee.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      type: employee.type,
      companyId: employee.companyId,
      department: employee.department,
      position: employee.position
    });
  } catch (error) {
    console.error('Error during employee login:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

app.get('/api/employees', async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const employees = await Employee.find({ companyId });
  res.json(employees);
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if it exists
    delete updateData.password;

    const employee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Return employee data without password
    const { password: pw, ...employeeData } = employee.toObject();
    res.json(employeeData);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Accept student application
app.post('/api/applications/:applicationId/students/:studentId/accept', async (req, res) => {
  try {
    const { applicationId, studentId } = req.params;
    const { mailSubject, mailBody } = req.body;

    const application = await Application.findById(applicationId)
      .populate('students.studentId', 'name email')
      .populate('roleId', 'jobTitle')
      .populate('applicationToCompany', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const studentIndex = application.students.findIndex(s => s.studentId._id.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in application' });
    }

    // Update student status
    application.students[studentIndex].status = 'accepted';
    await application.save();

    // Send email to student
    const student = application.students[studentIndex].studentId;
    await emailTransport.sendMail({
      to: student.email,
      subject: mailSubject,
      text: mailBody
    });

    res.json(application);
  } catch (error) {
    console.error('Error accepting student:', error);
    res.status(500).json({ message: 'Error accepting student' });
  }
});

// Reject student application
app.post('/api/applications/:applicationId/students/:studentId/reject', async (req, res) => {
  try {
    const { applicationId, studentId } = req.params;
    const { mailSubject, mailBody } = req.body;

    const application = await Application.findById(applicationId)
      .populate('students.studentId', 'name email')
      .populate('roleId', 'jobTitle')
      .populate('applicationToCompany', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const studentIndex = application.students.findIndex(s => s.studentId._id.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in application' });
    }

    // Update student status
    application.students[studentIndex].status = 'rejected';
    await application.save();

    // Send email to student
    const student = application.students[studentIndex].studentId;
    await emailTransport.sendMail({
      to: student.email,
      subject: mailSubject,
      text: mailBody
    });
    res.json(application);
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).json({ message: 'Error rejecting student' });
  }
});

// Register a new college (moved to /api/college/register)
app.post('/api/college/register', async (req, res) => {
  try {
    const {
      name,
      code,
      location,
      website,
      contactEmail,
      contactPhone,
      password,
      placementOfficer,
      departments,
      establishedYear,
      campusSize
    } = req.body;

    if (!name || !code || !location || !contactEmail || !contactPhone || !password || !placementOfficer || !departments || !establishedYear || !campusSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate code or email
    const existing = await College.findOne({ $or: [ { code }, { contactEmail } ] });
    if (existing) {
      return res.status(409).json({ error: 'College with this code or email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const college = new College({
      name,
      code,
      location,
      website,
      contactEmail,
      contactPhone,
      password: hashedPassword,
      placementOfficer,
      departments,
      establishedYear,
      campusSize
    });
    await college.save();
    const { password: pw, ...collegeData } = college.toObject();
    res.status(201).json(collegeData);
  } catch (err) {
    console.error('Error registering college:', err);
    res.status(500).json({ error: 'Failed to register college', details: err.message });
  }
});

// Initiate college registration: send OTP
app.post('/api/college/register/initiate', async (req, res) => {
  try {
    const {
      name,
      code,
      location,
      website,
      contactEmail,
      contactPhone,
      placementOfficer,
      departments,
      establishedYear,
      campusSize
    } = req.body;

    if (!name || !code || !location || !contactEmail || !contactPhone || !placementOfficer || !departments || !establishedYear || !campusSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate code or email in College
    const existing = await College.findOne({ $or: [ { code }, { contactEmail } ] });
    if (existing) {
      return res.status(409).json({ error: 'College with this code or email already exists' });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email (for the same type, college)
    await RegistrationOtp.deleteMany({ email: contactEmail, type: 'college' });

    // Store OTP and college info with the new schema structure
    await RegistrationOtp.create({
      email: contactEmail,
      otp,
      expiresAt,
      type: 'college', // Specify the type of registration
      data: { // Store the college info in the generic data field
        name,
        code,
        location,
        website,
        contactEmail,
        contactPhone,
        placementOfficer,
        departments,
        establishedYear,
        campusSize
      }
    });

    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: contactEmail,
      subject: 'Your College Registration OTP',
      text: `Your OTP for college registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Error initiating college registration:', err);
    res.status(500).json({ error: 'Failed to initiate registration', details: err.message });
  }
});

// Verify OTP validity without completing registration
app.post('/api/register/check-otp', async (req, res) => {
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

// Verify OTP and complete college registration
app.post('/api/college/register/verify', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }

    // Find the OTP entry
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'college' });

    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or registration session expired.' });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp !== otp || registrationOtp.expiresAt < new Date()) {
      // Delete the invalid/expired OTP to prevent further attempts
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Validate password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    // Optional: Add password strength validation here if needed

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the college using stored info and hashed password
    const collegeInfo = registrationOtp.data; // Get college info from the generic data field
    const newCollege = new College({
      ...collegeInfo,
      password: hashedPassword // Use the hashed password
    });

    await newCollege.save();

    // Delete the used OTP entry
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });

    const { password: pw, ...collegeData } = newCollege.toObject();
    res.status(201).json({ message: 'College registered successfully!', college: collegeData });

  } catch (err) {
    console.error('Error verifying OTP and registering college:', err);
    res.status(500).json({ error: 'Failed to complete registration', details: err.message });
  }
});

// Initiate company registration: send OTP
app.post('/api/company/register/initiate', async (req, res) => {
  try {
    const {
      name,
      type,
      industry,
      website,
      location,
      contactEmail,
      contactPhone,
      adminContact,
      companySize,
      foundedYear,
      description
    } = req.body;

    // Validate required fields
    if (!name || !type || !industry || !location || !contactEmail || !contactPhone || !companySize || !foundedYear || !description || !adminContact || !adminContact.name || !adminContact.email || !adminContact.phone || !adminContact.designation) {
      return res.status(400).json({ error: 'Missing required company fields.' });
    }

    // Check for duplicate company name or email
    const existingCompany = await Company.findOne({ $or: [ { name }, { contactEmail } ] });
    if (existingCompany) {
      return res.status(409).json({ error: 'Company with this name or email already exists.' });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email and type
    await RegistrationOtp.deleteMany({ email: contactEmail, type: 'company' });

    // Store OTP and company info
    await RegistrationOtp.create({
      email: contactEmail,
      otp,
      expiresAt,
      type: 'company', // Specify the type of registration
      data: { // Store the company info
        name,
        type,
        industry,
        website,
        location,
        contactEmail,
        contactPhone,
        adminContact,
        companySize,
        foundedYear,
        description
      }
    });

    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: contactEmail,
      subject: 'Your Company Registration OTP',
      text: `Your OTP for company registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to company contact email.' });

  } catch (err) {
    console.error('Error initiating company registration:', err);
    res.status(500).json({ error: 'Failed to initiate company registration', details: err.message });
  }
});

// Verify OTP and complete company registration
app.post('/api/company/register/verify', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }

    // Find the OTP entry for company registration
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'company' });

    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or company registration session expired.' });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp !== otp || registrationOtp.expiresAt < new Date()) {
      // Optionally delete the invalid/expired OTP
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Validate password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the company using stored info and hashed password
    const companyInfo = registrationOtp.data; // Get company info from the generic data field
    const newCompany = new Company({
      ...companyInfo,
      password: hashedPassword, // Use the hashed password
      verificationStatus: 'pending' // Set initial verification status
    });

    await newCompany.save();

    // Delete the used OTP entry
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });

    // Prepare response (exclude password)
    const { password: pw, ...companyData } = newCompany.toObject();
    res.status(201).json({ message: 'Company registered successfully!', company: companyData });

  } catch (err) {
    console.error('Error verifying OTP and registering company:', err);
    res.status(500).json({ error: 'Failed to complete company registration', details: err.message });
  }
});

// Initiate employee registration: send OTP
app.post('/api/employee/register/initiate', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      position,
      companyId
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !department || !position || !companyId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    // Check for duplicate employee email
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee with this email already exists.' });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email and type
    await RegistrationOtp.deleteMany({ email, type: 'employee' });

    // Store OTP and employee info
    await RegistrationOtp.create({
      email,
      otp,
      expiresAt,
      type: 'employee',
      data: {
        name,
        email,
        phone,
        department,
        position,
        companyId
      }
    });

    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Your Employee Registration OTP',
      text: `Your OTP for employee registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to employee email.' });

  } catch (err) {
    console.error('Error initiating employee registration:', err);
    res.status(500).json({ error: 'Failed to initiate employee registration', details: err.message });
  }
});

// Verify OTP and complete employee registration
app.post('/api/employee/register/verify', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }

    // Find the OTP entry for employee registration
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'employee' });

    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or employee registration session expired.' });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp !== otp || registrationOtp.expiresAt < new Date()) {
      // Optionally delete the invalid/expired OTP
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Validate password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the employee using stored info and hashed password
    const employeeInfo = registrationOtp.data;
    const newEmployee = new Employee({
      ...employeeInfo,
      password: hashedPassword,
      type: 'employee' // Set default type
    });

    await newEmployee.save();

    // Delete the used OTP entry
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });

    // Prepare response (exclude password)
    const { password: pw, ...employeeData } = newEmployee.toObject();
    res.status(201).json({ message: 'Employee registered successfully!', employee: employeeData });

  } catch (err) {
    console.error('Error verifying OTP and registering employee:', err);
    res.status(500).json({ error: 'Failed to complete employee registration', details: err.message });
  }
});

// Add employee to company (supports both company admin and employee addition)
app.post('/api/company/:companyId/employees', async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      name,
      email,
      phone,
      department,
      position,
      type = 'employee', // Default type is employee
      password,
      addedBy // ID of the employee/company adding this employee
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !department || !position || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check for duplicate employee email
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee with this email already exists' });
    }

    // Validate employee type
    if (!['employee', 'hr', 'admin'].includes(type)) {
      return res.status(400).json({ error: 'Invalid employee type' });
    }

    // If addedBy is provided, verify the adding entity has permission
    if (addedBy) {
      // Check if addedBy is an employee
      const addingEmployee = await Employee.findById(addedBy);
      if (addingEmployee) {
        // Verify the employee belongs to the same company
        if (addingEmployee.companyId.toString() !== companyId) {
          return res.status(403).json({ error: 'Unauthorized to add employees to this company' });
        }
        // Only admin and hr can add employees
        if (!['admin', 'hr'].includes(addingEmployee.type)) {
          return res.status(403).json({ error: 'Only admin and HR can add employees' });
        }
      } else {
        // Check if addedBy is the company itself
        const addingCompany = await Company.findById(addedBy);
        if (!addingCompany || addingCompany._id.toString() !== companyId) {
          return res.status(403).json({ error: 'Unauthorized to add employees' });
        }
      }
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new employee
    const employee = new Employee({
      name,
      email,
      phone,
      department,
      position,
      type,
      companyId,
      password: hashedPassword,
      verified: true, // Since this is added by authorized personnel
      addedBy: addedBy || companyId // Track who added this employee
    });

    await employee.save();

    // Send welcome email to employee
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Welcome to ' + company.name,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to ${company.name}!</h2>
          <p>Dear ${name},</p>
          <p>Your employee account has been created successfully.</p>
          <p><strong>Your login details:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Password: ${password}</li>
          </ul>
          <p>Please login and change your password for security reasons.</p>
          <p>Best regards,<br>${company.name} Team</p>
        </div>
      `
    });

    // Return employee data without password
    const { password: pw, ...employeeData } = employee.toObject();
    res.status(201).json({
      message: 'Employee added successfully',
      employee: employeeData
    });

  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee', details: error.message });
  }
});

// Optimized endpoint for company applications with all related data
app.get('/api/company/:companyId/applications/complete', async (req, res) => {
  console.log('Handling request for company applications:', req.params.companyId);
  try {
    const { companyId } = req.params;

    // Get company data
    console.log('Fetching company data...');
    const company = await Company.findById(companyId);
    if (!company) {
      console.log('Company not found:', companyId);
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all applications with populated student data in a single query
    console.log('Fetching applications data...');
    const applications = await Application.aggregate([
      { $match: { applicationToCompany: new mongoose.Types.ObjectId(companyId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'collegestudents',
          localField: 'students.studentId',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $lookup: {
          from: 'internships',
          localField: 'studentDetails._id',
          foreignField: 'studentId',
          as: 'internships'
        }
      },
      {
        $lookup: {
          from: 'interviews',
          localField: 'studentDetails._id',
          foreignField: 'interviewee',
          as: 'interviews'
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'studentDetails._id',
          foreignField: 'studentId',
          as: 'jobs'
        }
      },
      {
        $addFields: {
          students: {
            $map: {
              input: '$students',
              as: 'student',
              in: {
                $mergeObjects: [
                  '$$student',
                  {
                    studentId: {
                      $let: {
                        vars: {
                          studentDetail: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$studentDetails',
                                  as: 'sd',
                                  cond: { $eq: ['$$sd._id', '$$student.studentId'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: {
                          $mergeObjects: [
                            '$$studentDetail',
                            {
                              internships: {
                                $filter: {
                                  input: '$internships',
                                  as: 'internship',
                                  cond: { $eq: ['$$internship.studentId', '$$student.studentId'] }
                                }
                              },
                              interview_scheduled: {
                                $filter: {
                                  input: '$interviews',
                                  as: 'interview',
                                  cond: { $eq: ['$$interview.interviewee', '$$student.studentId'] }
                                }
                              },
                              jobs: {
                                $filter: {
                                  input: '$jobs',
                                  as: 'job',
                                  cond: { $eq: ['$$job.studentId', '$$student.studentId'] }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          studentDetails: 0,
          internships: 0,
          interviews: 0,
          jobs: 0
        }
      }
    ]);

    console.log('Successfully fetched data for company:', companyId);
    res.json({ company, applications });
  } catch (error) {
    console.error('Error in applications endpoint:', error);
    res.status(500).json({ message: 'Error fetching applications data', error: error.message });
  }
});

// Optimized endpoint for college scheduled applications
app.get('/api/college/:collegeId/applications/complete', async (req, res) => {
  console.log('Handling request for college applications:', req.params.collegeId);
  try {
    const { collegeId } = req.params;

    // Get college data
    console.log('Fetching college data...');
    const college = await College.findById(collegeId);
    if (!college) {
      console.log('College not found:', collegeId);
      return res.status(404).json({ message: 'College not found' });
    }

    // Get all applications with populated data in a single query
    console.log('Fetching applications data...');
    const applications = await Application.aggregate([
      { $match: { college: new mongoose.Types.ObjectId(collegeId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'collegestudents',
          localField: 'students.studentId',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'applicationToCompany',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'roleDetails'
        }
      },
      {
        $addFields: {
          applicationToCompany: { $arrayElemAt: ['$companyDetails', 0] },
          roleId: { $arrayElemAt: ['$roleDetails', 0] },
          students: {
            $map: {
              input: '$students',
              as: 'student',
              in: {
                $mergeObjects: [
                  '$$student',
                  {
                    studentId: {
                      $let: {
                        vars: {
                          studentDetail: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$studentDetails',
                                  as: 'sd',
                                  cond: { $eq: ['$$sd._id', '$$student.studentId'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: '$$studentDetail'
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          studentDetails: 0,
          companyDetails: 0,
          roleDetails: 0
        }
      }
    ]);

    console.log('Successfully fetched data for college:', collegeId);
    res.json({ college, applications });
  } catch (error) {
    console.error('Error in college applications endpoint:', error);
    res.status(500).json({ message: 'Error fetching applications data', error: error.message });
  }
});

// Optimized endpoint for company scheduled interviews with all related data
app.get('/api/company/:companyId/interviews/complete', async (req, res) => {
  console.log('Handling request for company interviews:', req.params.companyId);
  try {
    const { companyId } = req.params;

    // Get company data
    console.log('Fetching company data...');
    const company = await Company.findById(companyId);
    if (!company) {
      console.log('Company not found:', companyId);
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all interviews with populated data in a single query
    console.log('Fetching interviews data...');
    const interviews = await Interview.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'collegestudents',
          localField: 'interviewee',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'interviewer',
          foreignField: '_id',
          as: 'interviewerDetails'
        }
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationId',
          foreignField: '_id',
          as: 'applicationDetails'
        }
      },
      {
        $addFields: {
          studentDetails: { $arrayElemAt: ['$studentDetails', 0] },
          interviewer: { $arrayElemAt: ['$interviewerDetails', 0] },
          applicationDetails: { $arrayElemAt: ['$applicationDetails', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          candidateName: 1,
          role: 1,
          date: 1,
          status: 1,
          link: 1,
          zoomLink: 1,
          zoomMeetingId: 1,
          zoomPassword: 1,
          notes: 1,
          feedback: 1,
          isDone: 1,
          interviewer: {
            _id: 1,
            name: 1,
            email: 1,
            position: 1
          },
          studentDetails: {
            _id: 1,
            name: 1,
            email: 1,
            rollNumber: 1,
            department: 1,
            batch: 1,
            cgpa: 1,
            skills: 1,
            resume: 1,
            campusScore: 1
          }
        }
      }
    ]);

    console.log('Successfully fetched data for company:', companyId);
    res.json({ company, interviews });
  } catch (error) {
    console.error('Error in interviews endpoint:', error);
    res.status(500).json({ message: 'Error fetching interviews data', error: error.message });
  }
});

// Update interview status
app.put('/api/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate interview ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }

    // Find and update the interview
    const interview = await Interview.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Return the updated interview
    res.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ message: 'Error updating interview', error: error.message });
  }
});

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: 'lax',
    // secure: process.env.NODE_ENV === 'production', // Enable in prod with HTTPS
  }
}));

// Serve static files (profile images, documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check/test route
app.get('/', (req, res) => {
  res.send('Backend running!');
});

// Error handling middleware (improved feedback)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Routes (Sales and Support)
app.use('/api/v1/user', require('./routes/user')); // Fixed path by adding leading '/'
app.use('/api/v1/placement', require('./routes/placement')); // Fixed path