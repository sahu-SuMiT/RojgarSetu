const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Authentication & Identity
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Student Identifiers
  studentId: { type: String, unique: true, sparse: true }, // Only one unique ID needed
  // rollNumber: { type: String, unique: true, sparse: true }, // Remove if studentId is enough

  // College Relationship
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },

  // Academic Info
  degree: String,
  major: String, // or 'department', pick one
  batch: String, // e.g. "2020-2024"
  joiningYear: Number,
  graduationYear: Number, // Use one graduation date field
  year: Number, // Current academic year (1, 2, 3, 4)
  gpa: { type: Number, min: 0, max: 10 },
  cgpa: { type: Number, min: 0, max: 10 },

  // Career & Profile
  headline: String, // replaces "title"
  careerObjective: String,
  portfolioUrl: String,
  githubUrl: String,
  linkedinUrl: String,
  resume: String, // resume link

  // Contact
  phone: String,
  location: String,

  // Personal Info
  dateOfBirth: Date,
  gender: String,
  nationality: String,

  // Skills & Tech
  skills: [{ type: String, trim: true }],
  programmingLanguages: [String],
  technologies: [String],

  // Projects / Achievements / Certifications / Activities
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

  // Verification & System
  verified: { type: Boolean, default: false },
  isCollegeVerified: { type: Boolean, default: false },
  isSalesVerified: { type: Boolean, default: false },

  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Timestamps
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);