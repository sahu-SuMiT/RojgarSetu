const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    // Basic email format validation
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Example minimum length
  },
  type: {
    type: String,
    required: true,
    enum: ['employee', 'hr', 'admin'], // Defined types
    default: 'employee'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  // Add other potential fields here as needed, e.g., phone, department, position
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4,
    min: 1,
    max: 10,
  },
    feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Review',
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 