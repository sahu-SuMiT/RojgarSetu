const Job = require('../models/Job');
const Application = require('../models/CollegeApplication');
const Feedback = require('../models/Feedback');
const Student = require('../models/Student');

exports.getDashboardData = async (req, res) => {
  try {
    // 🔒 Session/user check
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No session user' });
    }

    const userId = req.session.user.id;

    // Opportunities
    const totalOpportunities = await Job.countDocuments();
    const savedOpportunities = await Job.countDocuments({ savedBy: userId });

    // Applications grouped by status
    const statusDefs = [
      { status: "Applied", color: "blue" },
      { status: "Interview Scheduled", color: "green" },
      { status: "Offer Received", color: "yellow" },
      { status: "Rejected", color: "red" }
    ];
    const applicationsOverview = [];
    for (const { status, color } of statusDefs) {
      const count = await Application.countDocuments({ student: userId, status });
      if (count > 0) applicationsOverview.push({ status, count, color });
    }

    // Notifications (stub -- replace with real notifications if you have a model)
    const notificationsList = [
      { date: new Date().toLocaleDateString(), text: "Welcome to your dashboard!" }
    ];

    // Recent feedback
    const recentFeedback = await Feedback.find({ student: userId })
      .sort({ date: -1 })
      .limit(4)
      .lean();

    // Interview schedule
    const interviewApplications = await Application.find({
      student: userId,
      status: 'Interview Scheduled',
      interviewDate: { $gte: new Date() }
    })
      .sort({ interviewDate: 1 })
      .limit(3)
      .populate('job')
      .lean();

    const interviewSchedule = interviewApplications.map(app => ({
      id: app._id,
      company: app.job?.company || "",
      title: app.job?.title || "",
      date: app.interviewDate ? app.interviewDate.toLocaleDateString() : "",
      time: app.interviewDate ? app.interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
    }));

    const student = await Student.findById(userId).select('name email').lean();
    const profileCompletion = 100; // Compute as needed

    res.json({
      student,
      profileCompletion,
      opportunitiesOverview: { total: totalOpportunities, saved: savedOpportunities },
      applicationsOverview,
      notificationsList,
      recentFeedback: recentFeedback.map(fb => ({
        _id: fb._id,
        company: fb.company,
        title: fb.title || "",
        rating: fb.rating || 0,
        comment: fb.message || fb.feedback || "",
        date: fb.date ? fb.date.toLocaleDateString() : "",
      })),
      interviewSchedule
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
};