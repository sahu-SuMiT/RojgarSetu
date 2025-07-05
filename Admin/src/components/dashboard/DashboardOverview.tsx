import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, Building2, Ticket, MessageSquare, Mail, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function DashboardOverview() {
  const [counts, setCounts] = useState({
    colleges: 0,
    companies: 0,
    students: 0,
    loading: true,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [collegesRes, companiesRes, studentsRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/college-count`),
          axios.get(`${API_URL}/api/admin/company-count`),
          axios.get(`${API_URL}/api/admin/student-count`),
        ]);
        setCounts({
          colleges: collegesRes.data.count || 0,
          companies: companiesRes.data.count || 0,
          students: studentsRes.data.count || 0,
          loading: false,
        });
      } catch (err) {
        setCounts({ colleges: 0, companies: 0, students: 0, loading: false });
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/recent-activity`);
        const activities = [];

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        res.data.students.forEach(student => {
          const createdAt = new Date(student.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New Student",
              description: `Student ${student.name} registered`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        res.data.colleges.forEach(college => {
          const createdAt = new Date(college.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New College",
              description: `College ${college.name} added`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        res.data.companies.forEach(company => {
          const createdAt = new Date(company.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New Company",
              description: `Company ${company.name} added`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        res.data.supportTickets.forEach(ticket => {
          const createdAt = new Date(ticket.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New Support Ticket",
              description: `Support ticket #${ticket.ticketId} created: ${ticket.subject}`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        setRecentActivity(activities);
        setLoadingActivity(false);
      } catch (err) {
        setRecentActivity([]);
        setLoadingActivity(false);
      }
    };

    fetchCounts();
    fetchRecentActivity();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: counts.loading
        ? "..."
        : (counts.colleges + counts.companies + counts.students).toLocaleString(),
      change: "",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Colleges",
      value: counts.loading ? "..." : counts.colleges.toLocaleString(),
      change: "",
      icon: School,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Companies",
      value: counts.loading ? "..." : counts.companies.toLocaleString(),
      change: "",
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const quickActions = [
    {
      icon: <Ticket className="w-5 h-5 mr-2" />,
      label: "Create New Ticket",
      onClick: () => { },
    },
    {
      icon: <MessageSquare className="w-5 h-5 mr-2" />,
      label: "Start Live Chat",
      onClick: () => { },
    },
    {
      icon: <Users className="w-5 h-5 mr-2" />,
      label: "Add Staff",
      onClick: () => { },
    },
    {
      icon: <Mail className="w-5 h-5 mr-2" />,
      label: "Send Bulk Email",
      onClick: () => { },
    },
    {
      icon: <AlertCircle className="w-5 h-5 mr-2" />,
      label: "System Alert",
      onClick: () => { },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your placement platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {quickActions.map((action, idx) => (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start w-full text-base font-medium flex items-center"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingActivity ? (
                <p>Loading recent activity...</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}