import React, { useState, useEffect } from "react";
import {
  UserCircle,
  ClipboardList,
  Briefcase,
  FileText,
  Bell,
  Star,
  ArrowRight,
  Calendar,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";

// Safe fetch helper
async function safeFetch(url, options) {
  const mergedOptions = { credentials: 'include', ...(options || {}) };
  const res = await fetch(url, mergedOptions);
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const j = await res.json();
      throw new Error(j.error || j.message || "API error");
    } else {
      const text = await res.text();
      throw new Error(
        text.startsWith("<!doctype") || text.startsWith("<!DOCTYPE")
          ? "API error: Received HTML instead of JSON. (Check API URL, backend server and proxy/config.)"
          : `API error: ${res.status} ${text}`
      );
    }
  }
  return contentType && contentType.includes("application/json") ? res.json() : res.text();
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? "fill-yellow-400 text-yellow-400 drop-shadow" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-3xl border border-blue-100 bg-white/70 backdrop-blur-lg shadow-xl transition-transform hover:-translate-y-2 hover:shadow-2xl p-7 relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [opportunities, setOpportunities] = useState({ total: 0, saved: 0 });
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");
  // const navigate = useNavigate();

  // Fetch dashboard data from backend
  useEffect(() => {
    setLoading(true);
    setError("");
    safeFetch("/api/dashboard", { credentials: "include" })
      .then((data) => {
        setStudent(data.student || {});
        setProfileCompletion(data.profileCompletion || 0);
        setOpportunities(data.opportunitiesOverview || { total: 0, saved: 0 });
        setApplications(data.applicationsOverview || []);
        setNotifications(data.notificationsList || []);
        setFeedbacks(data.recentFeedback || []);
        setInterviews(data.interviewSchedule || []);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  // Color mapping for applications
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-300",
    green: "bg-green-50 text-green-700 border-green-300",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-300",
    red: "bg-red-50 text-red-700 border-red-300",
    gray: "bg-gray-50 text-gray-700 border-gray-300",
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-3xl w-96 h-80 bg-gradient-to-r from-blue-100 via-slate-100 to-blue-50 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-red-500 font-bold">{error}</span>
      </div>
    );
  }

  return (
    <section className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen flex flex-col gap-12">
      {/* Header */}
      <div className="relative flex flex-col md:flex-row items-center px-10 py-10 rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 mb-2">
        <div className="absolute -right-10 -top-10 opacity-10 scale-150 pointer-events-none">
          <UserCircle className="w-64 h-64 text-blue-200" />
        </div>
        <UserCircle className="w-20 h-20 md:mr-8 text-white drop-shadow-lg z-10 rounded-full bg-blue-500/40 p-2 border-4 border-white" />
        <div className="z-10 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow">
            Welcome back{student?.name ? `, ${student.name}` : ""}!
          </h2>
          <div className="text-blue-100/90 text-lg font-medium mt-1">Ready for your next opportunity?</div>
        </div>
      </div>
      {/* 3-Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Completion */}
        <GlassCard className="flex flex-col items-center justify-center min-h-[340px]">
          <div className="relative mb-4">
            {/* Animated Circular Progress */}
            <svg className="w-28 h-28" viewBox="0 0 36 36">
              <circle className="text-gray-200" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle
                className="text-blue-500 transition-all duration-700"
                cx="18" cy="18" r="16" fill="none"
                stroke="currentColor" strokeWidth="4"
                strokeDasharray={`${profileCompletion * 1.005}, 100`}
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${profileCompletion * 1.005}, 100`,
                  transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)"
                }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-extrabold text-3xl text-blue-700 drop-shadow">
              {profileCompletion}%
            </span>
          </div>
          <div className="text-lg font-bold mb-2">Profile Completion</div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2 mt-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium tracking-tight shadow transition"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-25 transition pointer-events-none text-blue-300">
            <ClipboardList className="w-16 h-16" />
          </div>
        </GlassCard>
        {/* Opportunities Overview */}
        <GlassCard className="flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-4 mb-4">
            <span className="rounded-full bg-blue-100 p-2">
              <Briefcase className="w-7 h-7 text-blue-600" />
            </span>
            <div>
              <div className="font-bold text-xl tracking-tight">Opportunities</div>
              <div className="text-xs text-gray-400">Jobs & Internships</div>
            </div>
          </div>
          <div className="flex items-center gap-12 mt-2 mb-4">
            <div className="flex flex-col items-center">
              <span className="font-extrabold text-3xl text-blue-700 drop-shadow">{opportunities.total}</span>
              <span className="text-xs text-gray-500">Available</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-extrabold text-3xl text-green-600 drop-shadow">{opportunities.saved}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Bookmark className="w-4 h-4 inline-block" /> Saved
              </span>
            </div>
          </div>
          <Link
            to="/Jobs"
            className="mt-auto inline-flex items-center gap-2 px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full font-medium transition"
          >
            View All Opportunities
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-25 transition pointer-events-none text-blue-400">
            <Briefcase className="w-16 h-16" />
          </div>
        </GlassCard>
        {/* Applications Overview */}
        <GlassCard className="flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-4 mb-4">
            <span className="rounded-full bg-purple-100 p-2">
              <FileText className="w-7 h-7 text-purple-600" />
            </span>
            <div>
              <div className="font-bold text-xl tracking-tight">Applications</div>
              <div className="text-xs text-gray-400">Your Statuses</div>
            </div>
          </div>
          <div className="flex gap-3 mt-3 mb-4 flex-wrap">
            {applications.length === 0 ? (
              <div className="flex flex-col items-center w-full py-5 text-gray-300">
                <FileText className="w-8 h-8 mb-2" />
                <span>No applications yet.</span>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.status}
                  className={`flex flex-col items-center px-4 py-1 rounded-2xl border ${colorMap[app.color] || colorMap.gray
                    } font-semibold shadow-md min-w-[90px] hover:scale-105 transition`}
                >
                  <span className="font-bold text-xl">{app.count}</span>
                  <span className="text-xs">{app.status}</span>
                </div>
              ))
            )}
          </div>
          <Link
            to="/applications"
            className="mt-auto inline-flex items-center gap-2 px-5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full font-medium transition"
          >
            View All Applications
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-25 transition pointer-events-none text-purple-400">
            <FileText className="w-16 h-16" />
          </div>
        </GlassCard>
      </div>
      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Notifications */}
        <GlassCard className="flex flex-col min-h-[220px]">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-orange-100 p-2">
              <Bell className="w-6 h-6 text-orange-500" />
            </span>
            <span className="font-bold text-lg">Notifications</span>
          </div>
          <ul className="flex-1 space-y-4">
            {notifications.length === 0 ? (
              <li className="flex flex-col items-center w-full py-5 text-gray-300">
                <Bell className="w-8 h-8 mb-1" />
                <span>No recent notifications.</span>
              </li>
            ) : (
              notifications.slice(0, 5).map((n, i) => (
                <li key={i} className="flex flex-col border-l-4 border-blue-200 pl-4 py-1">
                  <span className="text-xs text-gray-400">{n.date}</span>
                  <span className="text-sm text-gray-700">{n.text}</span>
                </li>
              ))
            )}
          </ul>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-25 transition pointer-events-none text-orange-300"><Bell className="w-14 h-14" /></div>
        </GlassCard>
        {/* Recent Feedback */}
        <GlassCard className="flex flex-col min-h-[220px]">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-green-100 p-2">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </span>
            <span className="font-bold text-lg">Recent Feedback</span>
          </div>
          <ul className="flex-1 space-y-4">
            {feedbacks.length === 0 ? (
              <li className="flex flex-col items-center w-full py-5 text-gray-300">
                <MessageSquare className="w-8 h-8 mb-1" />
                <span>No recent feedback.</span>
              </li>
            ) : (
              feedbacks.slice(0, 4).map((fb, i) => (
                <li key={i} className="flex items-start gap-3 bg-green-50/80 rounded-lg p-3 border border-green-100 shadow-sm hover:scale-[1.02] transition">
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{fb.company}</span>
                      <span className="mx-1 text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{fb.title}</span>
                    </div>
                    <StarRating rating={fb.rating} />
                    <p className="text-sm text-gray-700 mt-1">{fb.comment || fb.feedback}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-25 transition pointer-events-none text-green-400"><MessageSquare className="w-14 h-14" /></div>
        </GlassCard>
        {/* Upcoming Interviews */}
        <GlassCard className="flex flex-col min-h-[220px]">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-blue-100 p-2">
              <Calendar className="w-6 h-6 text-blue-600" />
            </span>
            <span className="font-bold text-lg">Upcoming Interviews</span>
          </div>
          <ul className="flex-1 space-y-4">
            {(!interviews || interviews.length === 0) ? (
              <li className="flex flex-col items-center w-full py-5 text-gray-300">
                <Calendar className="w-8 h-8 mb-1" />
                <span>No upcoming interviews.</span>
              </li>
            ) : (
              interviews.slice(0, 3).map((intv) => (
                <li key={intv.id || intv._id} className="flex flex-col border-l-4 border-blue-100 pl-4 py-1">
                  <span className="font-bold text-blue-700">{intv.company}</span>
                  <span className="text-xs text-gray-500">{intv.title}</span>
                  <span className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 inline-block text-blue-400" />
                    {intv.date} &bull; {intv.time}
                  </span>
                </li>
              ))
            )}
          </ul>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-25 transition pointer-events-none text-blue-400"><Calendar className="w-14 h-14" /></div>
        </GlassCard>
      </div>
    </section>
  );
};

export default StudentDashboard;