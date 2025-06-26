import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [collegeCount, setCollegeCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, collegeRes, companyRes, studentCountRes, collegeCountRes, companyCountRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/students`),
          axios.get(`${API_URL}/api/admin/colleges`),
          axios.get(`${API_URL}/api/admin/companies`),
          axios.get(`${API_URL}/api/admin/student-count`),
          axios.get(`${API_URL}/api/admin/college-count`),
          axios.get(`${API_URL}/api/admin/company-count`),
        ]);

        if (studentRes.data && Array.isArray(studentRes.data.data)) {
          setStudents(studentRes.data.data);
        } else {
          setStudents([]);
        }

        if (collegeRes.data && Array.isArray(collegeRes.data.data)) {
          setColleges(collegeRes.data.data);
        } else {
          setColleges([]);
        }

        if (companyRes.data && Array.isArray(companyRes.data.data)) {
          setCompanies(companyRes.data.data);
        } else {
          setCompanies([]);
        }

        setStudentCount(studentCountRes.data.count || 0);
        setCollegeCount(collegeCountRes.data.count || 0);
        setCompanyCount(companyCountRes.data.count || 0);

      } catch (err) {
        console.error("Error fetching data:", err);
        setStudents([]);
        setColleges([]);
        setCompanies([]);
        setStudentCount(0);
        setCollegeCount(0);
        setCompanyCount(0);
      }
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userStats = [
    {
      title: "Total Students",
      value: studentCount.toString(),
      change: "+234",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      title: "Colleges",
      value: collegeCount.toString(),
      change: "+12",
      icon: School,
      color: "text-green-600",
    },
    {
      title: "Companies",
      value: companyCount.toString(),
      change: "+89",
      icon: Building2,
      color: "text-purple-600",
    },
    // {
    //   title: "Pending Verifications",
    //   value: students.filter(s => s.status === "pending").length.toString(),
    //   change: "-5",
    //   icon: UserCheck,
    //   color: "text-orange-600",
    // },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>CGPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.college && typeof student.college === "object"
                          ? student.college.name
                          : "-"}
                      </TableCell>
                      <TableCell>{student.rollNumber || "-"}</TableCell>
                      <TableCell>{student.department || "-"}</TableCell>
                      <TableCell>{student.batch || "-"}</TableCell>
                      <TableCell>{student.cgpa || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="colleges" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((college) => (
                    <TableRow key={college._id}>
                      <TableCell>{college.name}</TableCell>
                      <TableCell>{college.contactEmail}</TableCell>
                      <TableCell>{college.location || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company._id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.contactEmail}</TableCell>
                      <TableCell>{company.location || "-"}</TableCell>
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