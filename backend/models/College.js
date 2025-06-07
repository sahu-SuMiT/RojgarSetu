const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
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
  password: {
    type: String,
    required: true
  },
  placementOfficer: {
    name: String,
    email: String,
    phone: String
  },
  departments: [{
    name: String,
    code: String
  }],
 
  establishedYear: {
    type: Number,
    required: true
  },
  campusSize: {
    type: Number, // in acres
    required: true
  },
  
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema); 