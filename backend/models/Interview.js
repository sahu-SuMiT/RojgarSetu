const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  interviewerName: { type: String, required: true },
  interviewerTitle: { type: String },
  time: { type: String, required: true }, // e.g., '2:00 PM'
  duration: { type: String },             // e.g., '60 minutes'
  type: { type: String, enum: ['video', 'phone', 'in-person'], required: true },
  platform: { type: String },             // e.g., 'Zoom', 'Google Meet'
  location: { type: String },             // URL or address or phone number
  round: { type: String },                // e.g., 'Technical Interview'
  // notes: { type: String },
  preparation: [String],
  createdAt: { type: Date, default: Date.now },

  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  interviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'CollegeStudent', required: true },
  candidateName: { type: String },
  campusScore: { type: Number },
  link: { type: String },
  zoomMeetingId: { type: String },
  zoomPassword: { type: String },
  isDone: { type: Boolean, default: false },
  date: { type: Date, required: true },
  feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
  role: { type: String, default:'SDE'},
  status: { type: String, enum: ["scheduled", "in-progress", "completed", "cancelled", "selected", "rejected", "accepted"], default: "scheduled" },
  interviewDate: { type: String },
  interviewTime: { type: String },
 
  notes: { type: String ,default: "keep a pen and paper with you"}
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);