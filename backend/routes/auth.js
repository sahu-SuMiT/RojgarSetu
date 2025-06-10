const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // or 'bcrypt' depending on your project
const mongoose = require('mongoose');

const College = require('../models/College');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const RegistrationOtp = require('../models/RegistrationOtp');

//College-company login and (otp verification during registration)

// app.post('/api/auth/college-admin') .....Post, login using college-contact mail
// app.post('/api/auth/company-admin') .....Post, login using company mail or employee registered mail
// app.post('/api/auth/register/check-otp') opt needed using college or company registration

router.post('/college-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    

    const college = await College.findOne({ contactEmail: email });
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, college.password);
    if(!isMatch)
      isMatch = (password.includes(college.password))
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
router.post('/company-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
   
    // First try to find an employee with admin type
    const employee = await Employee.findOne({ 
      email: email, // Only allow admin type employees
    });

    if (employee) {
      // Employee login flow
      
      // Compare hashed password
      var isMatch = await bcrypt.compare(password, employee.password);
      if(!isMatch){
        isMatch = (password === employee.password)
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get company details
      const company = await Company.findById(employee.companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

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
    const company = await Company.findOne({ contactEmail: email });
    if (!company) {
      return res.status(404).json({ error: 'Company Does not exist credentials' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, company.password);
    if(!isMatch){
      isMatch = (password === company.password)
    }
    if (!isMatch) {
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

module.exports = router;