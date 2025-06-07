const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new mongoose.Schema({
  company: { type: String, required: true },
  location: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  qualifications: [String],
  benefits: [String],
  aboutCompany: { type: String },
  applicants: { type: Number, default: 0 },
  posted: { type: String }, // e.g. '2 days ago'
  type: { type: String, enum: ['Internship', 'Full-time', 'Part-time'], default: 'Full-time' },
  duration: { type: String },

  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'CollegeStudent',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
  },
  salary: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: true
  },
  status: {
    type: String,
    enum: ['offered', 'accepted', 'rejected', 'completed'],
    default: 'offered'
  },
  feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// College and Company
// Index for efficient querying
jobSchema.index({ studentId: 1, companyId: 1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema);