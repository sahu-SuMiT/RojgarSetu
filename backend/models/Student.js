const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Login and basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // College relationship
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },

  // Academic info

  rollNumber: { type: String, unique: true },
  department: String,
  batch: String,
  joiningYear: Number,
  graduationYear: Number,
  degree: String,
  major: String,
  year: Number,
  gpa: Number,
  cgpa: { type: Number, min: 0, max: 10 },

  // Career & job profile
  headline: String,
  careerObjective: String,
  portfolioUrl: String,
  githubUrl: String,
  linkedinUrl: String,

  // Contact
  phone: String,
  location: String,

  // Personal info
  dateOfBirth: Date,
  gender: String,
  nationality: String,

  // Skills and technologies
  skills: [{ type: String, trim: true }],
  programmingLanguages: [String],
  technologies: [String],

  // Resume
  resume: String,

  // Projects, Achievements, Certifications, Extracurricular, Research, Hackathons
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    link: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }],
  extracurricular: [{
    activity: String,
    role: String,
    achievement: String
  }],
  research: [{
    title: String,
    role: String,
    year: Number,
    description: String
  }],
  hackathons: [{
    name: String,
    year: Number,
    achievement: String,
    description: String
  }],

  // Saved jobs (for job portal)
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Profile picture (Buffer and fallback URL)
  profilePic: {
    data: Buffer,
    contentType: String,
  },
  profileImage: {
    type: String,
    default: 'https://plus.unsplash.com/premium_photo-1738637233381-6f857ce13eb9?w=400&auto=format&fit=crop&q=60'
  },

  // Verifications
  verified: { type: Boolean, default: false },
  isCollegeVerified: { type: Boolean, default: false },
  isSalesVerified: { type: Boolean, default: false },

  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);