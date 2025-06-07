import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  School, 
  Building2, 
  GraduationCap, 
  Search, 
  Filter, 
  MoreHorizontal,
  Check,
  X,
  Eye,
  UserCheck,
  UserX
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const userStats = [
    {
      title: "Total Students",
      value: "8,456",
      change: "+234",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      title: "College Admins",
      value: "342",
      change: "+12",
      icon: School,
      color: "text-green-600",
    },
    {
      title: "Companies",
      value: "1,156",
      change: "+89",
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Pending Verifications",
      value: "23",
      change: "-5",
      icon: UserCheck,
      color: "text-orange-600",
    },
  ];

  const students = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul.sharma@email.com",
      college: "Delhi University",
      course: "Computer Science",
      year: "Final Year",
      status: "verified",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya.patel@email.com",
      college: "Mumbai University",
      course: "Electronics",
      year: "Third Year",
      status: "pending",
      joinDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Amit Kumar",
      email: "amit.kumar@email.com",
      college: "IIT Delhi",
      course: "Mechanical",
      year: "Final Year",
      status: "verified",
      joinDate: "2024-01-10",
    },
  ];

  const colleges = [
    {
      id: 1,
      name: "Delhi University",
      adminName: "Dr. Rajesh Gupta",
      email: "admin@du.ac.in",
      students: 1234,
      status: "verified",
      joinDate: "2023-08-15",
    },
    {
      id: 2,
      name: "Mumbai University",
      adminName: "Prof. Sunita Shah",
      email: "admin@mu.ac.in",
      students: 2156,
      status: "verified",
      joinDate: "2023-09-01",
    },
  ];

  const companies = [
    {
      id: 1,
      name: "TechCorp Solutions",
      contact: "HR Manager",
      email: "hr@techcorp.com",
      industry: "Technology",
      employees: "1000+",
      status: "verified",
      joinDate: "2023-10-12",
    },
    {
      id: 2,
      name: "InnovateLabs",
      contact: "Recruitment Head",
      email: "careers@innovatelabs.com",
      industry: "Software",
      employees: "500-1000",
      status: "pending",
      joinDate: "2024-01-25",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users across the platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change} this month</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>View and manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="students" className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger value="colleges" className="flex items-center space-x-2">
                <School className="w-4 h-4" />
                <span>Colleges</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Companies</span>
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="students" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.college}</TableCell>
                      <TableCell>
                        <div>
                          <p>{student.course}</p>
                          <p className="text-sm text-gray-500">{student.year}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>{student.joinDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Check className="w-4 h-4 mr-2" />
                              Verify User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <X className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="colleges" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{college.name}</p>
                          <p className="text-sm text-gray-500">{college.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{college.adminName}</TableCell>
                      <TableCell>{college.students}</TableCell>
                      <TableCell>{getStatusBadge(college.status)}</TableCell>
                      <TableCell>{college.joinDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Check className="w-4 h-4 mr-2" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-gray-500">{company.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{company.contact}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.employees}</TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Check className="w-4 h-4 mr-2" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}