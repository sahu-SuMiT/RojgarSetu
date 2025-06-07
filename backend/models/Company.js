const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['MNC', 'Startup', 'SME', 'Government', 'NGO', 'Other'],
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  adminContact: {
    name: String,
    email: String,
    phone: String,
    designation: String
  },
  companySize: {
    type: String,
    enum: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
    required: true
  },
  foundedYear: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'pending'
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema); 