const Student = require('../../models/Student');
const College = require('../../models/College');
const Company = require('../../models/Company');
const User = require('../../models/User');
const { emailTransport } = require('../../config/email');

const DEFAULT_PASSWORD = "Campus@123";

// Helper to get salesId from userName
async function getSalesIdByUserName(userName) {
  // Split userName into firstName and lastName
  const [firstName, ...rest] = userName.trim().split(" ");
  const lastName = rest.join(" ");
  const user = await User.findOne({ firstName, lastName });
  return user ? user._id : null; // Use _id as salesId
}

exports.addStudent = async (req, res) => {
  try {
    const { name, email, password, userName } = req.body;
    if (!name || !email || !password || !userName) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) {
      return res.status(404).json({ message: "Sales ID not found for this user." });
    }
    const student = new Student({ name, email, password, salesId });
    await student.save();

    // Send email with credentials
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Your Student Account Credentials',
      text: `Welcome, ${name}!\nYour login ID: ${email}\nYour password: ${password}\nPlease change your password after first login.`
    });

    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.addCollege = async (req, res) => {
  try {
    const { name, code, contactEmail, contactPhone, userName } = req.body;
    if (!name || !code || !contactEmail || !contactPhone || !userName) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) {
      return res.status(404).json({ message: "Sales ID not found for this user." });
    }
    const college = new College({
      name,
      code,
      contactEmail,
      contactPhone,
      password: DEFAULT_PASSWORD,
      salesId
    });
    await college.save();

    // Send email with credentials
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: contactEmail,
      subject: 'Your College Account Credentials',
      text: `Welcome, ${name}!\nYour login ID: ${contactEmail}\nYour password: ${DEFAULT_PASSWORD}\nPlease change your password after first login.`
    });

    res.status(201).json({ message: "College added successfully", college });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.addCompany = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone, userName } = req.body;
    if (!name || !contactEmail || !contactPhone || !userName) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) {
      return res.status(404).json({ message: "Sales ID not found for this user." });
    }
    const company = new Company({
      name,
      contactEmail,
      contactPhone,
      password: DEFAULT_PASSWORD,
      salesId
    });
    await company.save();

    // Send email with credentials
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: contactEmail,
      subject: 'Your Company Account Credentials',
      text: `Welcome, ${name}!\nYour login ID: ${contactEmail}\nYour password: ${DEFAULT_PASSWORD}\nPlease change your password after first login.`
    });

    res.status(201).json({ message: "Company added successfully", company });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch students for this salesId
exports.getStudentsBySales = async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) return res.status(400).json({ message: "userName is required" });
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) return res.status(404).json({ message: "Sales ID not found for this user." });
    const students = await Student.find({ salesId });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch colleges for this salesId
exports.getCollegesBySales = async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) return res.status(400).json({ message: "userName is required" });
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) return res.status(404).json({ message: "Sales ID not found for this user." });
    const colleges = await College.find({ salesId });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch companies for this salesId
exports.getCompaniesBySales = async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) return res.status(400).json({ message: "userName is required" });
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) return res.status(404).json({ message: "Sales ID not found for this user." });
    const companies = await Company.find({ salesId });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};