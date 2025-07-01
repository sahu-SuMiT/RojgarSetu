import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, School, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
}

interface College {
  id: string;
  name: string;
  location: string;
  established: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  joinedDate: string;
}
const API_URL= import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get sales username from localStorage
const getSalesUserName = () => localStorage.getItem("userName") || "";

const Onboard = () => {
  const token = localStorage.getItem("token");
  let salesId = "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      salesId = decoded.salesId || "";
    } catch (e) {
      salesId = "";
    }
  }

  // console.log("Sales ID from JWT:", salesId);

  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [newCollege, setNewCollege] = useState({
    name: "",
    code: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [newCompany, setNewCompany] = useState({
    name: "",
    contactEmail: "",
    contactPhone: ""
  });

  useEffect(() => {
    const fetchEntities = async () => {
      const userName = localStorage.getItem("userName");
      if (!userName) return;

      try {
        const [stuRes, colRes, comRes] = await Promise.all([
          axios.get(`${API_URL}/api/sales/students?userName=${encodeURIComponent(userName)}`),
          axios.get(`${API_URL}/api/sales/colleges?userName=${encodeURIComponent(userName)}`),
          axios.get(`${API_URL}/api/sales/companies?userName=${encodeURIComponent(userName)}`)
        ]);
        setStudents(stuRes.data);
        setColleges(colRes.data);
        setCompanies(comRes.data);
      } catch (err) {
        toast.error("Failed to fetch entities");
      }
    };

    fetchEntities();
  }, []);

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const userName = localStorage.getItem("userName");
      await axios.post(
        `${API_URL}/api/sales/student`,
        { ...newStudent, userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student added successfully!");
      setIsAddStudentOpen(false);
      setNewStudent({ name: "", email: "", password: "" });
      await fetchEntities();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add student");
    }
  };

  const handleAddCollege = async () => {
    if (!newCollege.name || !newCollege.code || !newCollege.contactEmail || !newCollege.contactPhone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const userName = localStorage.getItem("userName");
    try {
      await axios.post(
        `${API_URL}/api/sales/college`,
        { ...newCollege, userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("College added successfully!");
      setIsAddCollegeOpen(false);
      setNewCollege({ name: "", code: "", contactEmail: "", contactPhone: "" });
      await fetchEntities();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add college");
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.contactEmail || !newCompany.contactPhone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const userName = localStorage.getItem("userName");
    try {
      await axios.post(
        `${API_URL}/api/sales/company`,
        { ...newCompany, userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Company added successfully!");
      setIsAddCompanyOpen(false);
      setNewCompany({ name: "", contactEmail: "", contactPhone: "" });
      await fetchEntities();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add company");
    }
  };

  const fetchEntities = async () => {
    const userName = localStorage.getItem("userName");
    if (!userName) return;
    try {
      const [stuRes, colRes, comRes] = await Promise.all([
        axios.get(`${API_URL}/api/sales/students?userName=${encodeURIComponent(userName)}`),
        axios.get(`${API_URL}/api/sales/colleges?userName=${encodeURIComponent(userName)}`),
        axios.get(`${API_URL}/api/sales/companies?userName=${encodeURIComponent(userName)}`)
      ]);
      setStudents(stuRes.data);
      setColleges(colRes.data);
      setCompanies(comRes.data);
    } catch (err) {
      toast.error("Failed to fetch entities");
    }
  };

  const salesUserName = getSalesUserName();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Onboarding Dashboard</h1>
            <p className="text-gray-500">Manage students, colleges, and companies</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddStudentOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Add Student
            </Button>
            <Button
              onClick={() => setIsAddCollegeOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <School className="h-4 w-4" />
              Add College
            </Button>
            <Button
              onClick={() => setIsAddCompanyOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Students</p>
                  <h3 className="text-2xl font-bold mt-1">{students.length}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Colleges</p>
                  <h3 className="text-2xl font-bold mt-1">{colleges.length}</h3>
                </div>
                <School className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Companies</p>
                  <h3 className="text-2xl font-bold mt-1">{companies.length}</h3>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-3">Students</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sales Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  {/* <TableHead>Enrollment Date</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id || student.id}>
                      <TableCell>{salesUserName}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.enrollmentDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Colleges Table */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Colleges</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sales Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Contact Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colleges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No colleges found.
                    </TableCell>
                  </TableRow>
                ) : (
                  colleges.map((college) => (
                    <TableRow key={college._id || college.id}>
                      <TableCell>{salesUserName}</TableCell>
                      <TableCell>{college.name}</TableCell>
                      <TableCell>{college.code}</TableCell>
                      <TableCell>{college.contactEmail}</TableCell>
                      <TableCell>{college.contactPhone}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Companies</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sales Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Contact Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No companies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company._id || company.id}>
                      <TableCell>{salesUserName}</TableCell>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.contactEmail}</TableCell>
                      <TableCell>{company.contactPhone}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Student Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student-name">Name</Label>
                <Input
                  id="student-name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="Enter student email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="student-password">Password</Label>
                <Input
                  id="student-password"
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddStudent}
                disabled={
                  !newStudent.name ||
                  !newStudent.email ||
                  !newStudent.password
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add College Dialog */}
        <Dialog open={isAddCollegeOpen} onOpenChange={setIsAddCollegeOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New College</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="college-name">Name</Label>
                <Input
                  id="college-name"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                  placeholder="Enter college name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="college-code">College Code</Label>
                <Input
                  id="college-code"
                  value={newCollege.code}
                  onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value })}
                  placeholder="Enter college code"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="college-email">Contact Email</Label>
                <Input
                  id="college-email"
                  type="email"
                  value={newCollege.contactEmail}
                  onChange={(e) => setNewCollege({ ...newCollege, contactEmail: e.target.value })}
                  placeholder="Enter contact email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="college-phone">Contact Phone</Label>
                <Input
                  id="college-phone"
                  value={newCollege.contactPhone}
                  onChange={(e) => setNewCollege({ ...newCollege, contactPhone: e.target.value })}
                  placeholder="Enter contact phone"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCollegeOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCollege}
                disabled={
                  !newCollege.name ||
                  !newCollege.code ||
                  !newCollege.contactEmail ||
                  !newCollege.contactPhone
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add College
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Company Dialog */}
        <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Name</Label>
                <Input
                  id="company-name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-email">Contact Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={newCompany.contactEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                  placeholder="Enter contact email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-phone">Contact Phone</Label>
                <Input
                  id="company-phone"
                  value={newCompany.contactPhone}
                  onChange={(e) => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
                  placeholder="Enter contact phone"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCompanyOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCompany}
                disabled={
                  !newCompany.name ||
                  !newCompany.contactEmail ||
                  !newCompany.contactPhone
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Company
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Onboard;