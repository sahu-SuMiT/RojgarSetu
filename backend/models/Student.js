const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  phone: String,
  location: String,
  title: String,
  portfolioUrl: String,
  githubUrl: String,
  linkedinUrl: String,
  careerObjective: String,

  studentId: { type: String },
  dateOfBirth: String,
  gender: String,
  nationality: String,

  degree: String,
  major: String,
  year: String,
  gpa: String,
  expectedGraduation: String,

  programmingLanguages: [String],
  technologies: [String],

  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  
  rollNumber: {
    type: String,
    unique: true,
    required: true,
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'IT', 'ECE', 'ME', 'CE', 'EEE', 'Other'], // adjust as needed
  },
  isPlaced: {
    type: Boolean,
    default: false,
  },
  company: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);