const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import your models
const CollegeStudent = require('../models/CollegeStudent.model');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Interview = require('../models/Interview');
const Review = require('../models/Review');

//app.get('/api/students/college/:collegeId') .....
//app.post('/api/students/bulk') .....
//app.get('/api/students/:id') .....
//app.post('/api/students/verify') .....

router.get('/college/:collegeId', async (req, res) => {
  try {
    const students = await CollegeStudent.find({ college: req.params.collegeId });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/bulk', async (req, res) => {
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
router.get('/:id', async (req, res) => {
  try {
    
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
      return res.status(404).json({ message: 'Student not found' });
    }


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

    res.json(studentDetails);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ 
      message: 'Error fetching student details',
      error: error.message 
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // Find and update the student
    const updatedStudent = await CollegeStudent.findByIdAndUpdate(
      studentId,
      { isCollegeVerified: true },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ 
      message: 'Student verified successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error verifying student:', error);
    res.status(500).json({ 
      message: 'Error verifying student',
      error: error.message 
    });
  }
});

module.exports = router;