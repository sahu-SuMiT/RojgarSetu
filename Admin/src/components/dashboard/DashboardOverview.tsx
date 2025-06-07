import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, Building2, TrendingUp, Activity, Shield, HeadphonesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Colleges",
      value: "342",
      change: "+8%",
      icon: School,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Companies",
      value: "1,156",
      change: "+15%",
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const recentActivity = [
    {
      type: "User Registration",
      description: "New student registered from Delhi University",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      type: "Content Moderation",
      description: "Job posting flagged for review",
      time: "15 minutes ago",
      status: "flagged",
    },
    {
      type: "Support Ticket",
      description: "Password reset request from company user",
      time: "1 hour ago",
      status: "resolved",
    },
    {
      type: "Platform Alert",
      description: "High server load detected",
      time: "2 hours ago",
      status: "monitoring",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "flagged":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "monitoring":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your placement platform</p>
      </div>

      {/* Stats Grid */}
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
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Verify Users</span>
                </div>
                <Badge variant="secondary">23 pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Content Review</span>
                </div>
                <Badge variant="destructive">8 flagged</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <HeadphonesIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Support Tickets</span>
                </div>
                <Badge variant="outline">12 open</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Server Performance</span>
                  <span>94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Database Health</span>
                  <span>97%</span>
                </div>
                <Progress value={97} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>User Satisfaction</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Security Score</span>
                  <span>96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}