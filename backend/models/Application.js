const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    enum: [
      'applied',
      'under_review',
      'interview_scheduled',
      'offer_received',
      'rejected'
    ],
    default: 'applied'
  },
  nextStep: String,
  nextStepDate: Date,
  appliedDate: { type: Date, default: Date.now },
  coverLetter: String,
  experience: String,
  availability: String,

  applicationFromCollege: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  applicationToCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  roleName:{
    type:String,
    default:''
  },
  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollegeStudent',
      required: true
    },
    status: {
      type: String,
      enum: ['applied', 'accepted', 'rejected', 'interview-scheduled', 'interview-rescheduled', 'interview-cancelled'],
      default: 'applied'
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      default: null
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);