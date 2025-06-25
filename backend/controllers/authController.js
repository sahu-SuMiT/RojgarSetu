const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Helper to generate JWT
function generateStudentToken(student) {
  return jwt.sign(
    {
      id: student._id,
      name: student.name,
      email: student.email,
      type : 'student' // Assuming all users are students, adjust if you have roles
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}
// Student signup
exports.signup_student = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, password: hashedPassword });
    await student.save();

    // Generate JWT token
    const token = generateStudentToken(student);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Prevent CSRF attacks
    });
    res.status(201).json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Student login
exports.login_student = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateStudentToken(student);
    console.log(`Generated token for student ${student._id}: ${token}`);
    console.log("process.env.JWT_SECRET:", process.env.JWT_SECRET,"Node environment:", process.env.NODE_ENV);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Prevent CSRF attacks
    });

    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

