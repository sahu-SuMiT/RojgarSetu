const Student = require('../models/Student');

// Helper: Validate email format
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// Get student profile by ID
exports.getStudentProfile = async (req, res) => {
  try {
    const sessionUserId = req.session?.user?.id;
    if (!sessionUserId || sessionUserId !== req.params.studentId) {
      return res.status(403).json({ message: "Forbidden: You can only access your own profile." });
    }

    const student = await Student.findById(req.params.studentId).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    delete student.password;
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const sessionUserId = req.session?.user?.id;
    if (!sessionUserId || sessionUserId !== req.params.studentId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
    }

    const updates = { ...req.body };

    // Basic validation
    if (!updates.name || !updates.email) {
      return res.status(400).json({ message: "Name and email are required." });
    }
    if (!isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Never update password via profile
    delete updates.password;

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    delete student.password;
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};