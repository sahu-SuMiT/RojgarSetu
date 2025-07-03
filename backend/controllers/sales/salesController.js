const Student = require('../../models/Student');
const College = require('../../models/College');
const Company = require('../../models/Company');
const User = require('../../models/User');
const { emailTransport } = require('../../config/email');
const SupportTicket = require('../../models/SupportTicket');
const ManagerTicket = require('../../models/manager_ticket'); // Import your manager ticket model

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

exports.getSupportTicketsBySales = async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) return res.status(400).json({ message: "userName is required" });
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) return res.status(404).json({ message: "Sales ID not found for this user." });

    // Find all tickets for colleges/companies with this salesId
    const colleges = await College.find({ salesId });
    const companies = await Company.find({ salesId });

    const collegeIds = colleges.map(c => c._id.toString());
    const companyIds = companies.map(c => c._id.toString());

    // Find tickets for these users
    const tickets = await SupportTicket.find({
      $or: [
        { userType: 'college', userId: { $in: collegeIds } },
        { userType: 'company', userId: { $in: companyIds } }
      ]
    }).lean();

    // Attach email and phone to each ticket
    const collegeMap = {};
    colleges.forEach(c => { collegeMap[c._id] = c; });
    const companyMap = {};
    companies.forEach(c => { companyMap[c._id] = c; });

    const ticketsWithContact = tickets.map(ticket => {
      let email = "";
      let phone = "";
      if (ticket.userType === "college" && collegeMap[ticket.userId]) {
        email = collegeMap[ticket.userId].contactEmail;
        phone = collegeMap[ticket.userId].contactPhone;
      }
      if (ticket.userType === "company" && companyMap[ticket.userId]) {
        email = companyMap[ticket.userId].contactEmail;
        phone = companyMap[ticket.userId].contactPhone;
      }
      return { ...ticket, email, phone };
    });

    res.json(ticketsWithContact);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getManagerSupportTickets = async (req, res) => {
  try {
    // You can add filters if needed, for now fetch all manager tickets
    const tickets = await ManagerTicket.find().lean();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getSupportTicketsBySales = async (req, res) => {
  try {
    // Fetch all colleges and companies
    const colleges = await College.find();
    const companies = await Company.find();

    const collegeMap = {};
    colleges.forEach(c => { collegeMap[c._id] = c; });
    const companyMap = {};
    companies.forEach(c => { companyMap[c._id] = c; });

    // Fetch all tickets
    const tickets = await SupportTicket.find().lean();

    // Attach email and phone to each ticket
    const ticketsWithContact = tickets.map(ticket => {
      let email = "";
      let phone = "";
      if (ticket.userType === "college" && collegeMap[ticket.userId]) {
        email = collegeMap[ticket.userId].contactEmail;
        phone = collegeMap[ticket.userId].contactPhone;
      }
      if (ticket.userType === "company" && companyMap[ticket.userId]) {
        email = companyMap[ticket.userId].contactEmail;
        phone = companyMap[ticket.userId].contactPhone;
      }
      return { ...ticket, email, phone };
    });

    res.json(ticketsWithContact);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateTicketEvaluation = async (req, res) => {
  try {
    const { ticketId, evaluation } = req.body;
    const ticket = await SupportTicket.findOneAndUpdate(
      { _id: ticketId },
      { evaluation },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.markTicketResolved = async (req, res) => {
  try {
    const { ticketId, secretCode } = req.body;
    if (secretCode !== process.env.SECRET_CODE) {
      return res.status(403).json({ message: "Invalid secret code" });
    }
    const ticket = await SupportTicket.findOneAndUpdate(
      { _id: ticketId },
      { status: "resolved" },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



