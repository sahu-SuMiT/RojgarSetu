import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, RefreshCw, Download, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const initialEmployees = [
  {
    id: 1,
    username: "Raj Shivre",
    email: "raj@email.com",
    role: "admin",
    status: "active",
    permissions: ["User Management", "Employee Management", "Analytics", "Platform Settings"],
  },
  {
    id: 2,
    username: "Harsh Raj",
    email: "harshraj@email.com",
    role: "employee",
    status: "inactive",
    permissions: ["User Management", "Support Panel"],
  },
  {
    id: 3,
    username: "Anmol Tiwari",
    email: "anmol@email.com",
    role: "employee",
    status: "active",
    permissions: ["Analytics", "Content Moderation"],
  },
  {
    id: 4,
    username: "Kishori",
    email: "kishori@email.com",
    role: "admin",
    status: "active",
    permissions: ["User Management", "Employee Management", "Content Moderation", "Platform Settings"],
  },
  {
    id: 5,
    username: "Sumit Sahu",
    email: "sumit@email.com",
    role: "employee",
    status: "active",
    permissions: ["Support Panel"],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <span className="text-green-700 font-medium text-[10px]">Active</span>;
    case "inactive":
      return <span className="text-gray-500 font-medium text-[10px]">Inactive</span>;
    case "pending":
      return <span className="text-yellow-700 font-medium text-[10px]">Pending</span>;
    default:
      return <span className="text-gray-400 font-medium text-[10px]">Unknown</span>;
  }
};

const ALL_PERMISSIONS = [
  "User Management",
  "Employee Management",
  "Analytics",
  "Content Moderation",
  "Support Panel",
  "Platform Settings",
];

export function EmployeeManagement() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    type: "Admin",
    role: "employee",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Set Permissions modal state
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permUserId, setPermUserId] = useState<number|null>(null);
  const [permChecked, setPermChecked] = useState<string[]>([]);

  // Refresh animation state
  const [refreshing, setRefreshing] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number|null>(null);

  const openPermModal = (userId: number, currentPerms: string[]) => {
    setPermUserId(userId);
    setPermChecked(currentPerms);
    setPermModalOpen(true);
  };

  const handlePermChange = (perm: string) => {
    setPermChecked(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  const savePermissions = () => {
    if (permUserId == null) return;
    setEmployees(prev => prev.map(emp =>
      emp.id === permUserId ? { ...emp, permissions: permChecked } : emp
    ));
    setPermModalOpen(false);
    setPermUserId(null);
    setPermChecked([]);
  };

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400); // quick 0.4s rotation
    // Add actual refresh logic here if needed
  }

  // Export to CSV
  function exportToCSV() {
    if (!employees.length) return;
    const headers = ["ID", "Username", "Email", "Role", "Status", "Permissions"];
    const rows = employees.map(emp => [
      emp.id,
      emp.username,
      emp.email,
      emp.role,
      emp.status,
      emp.permissions.join("; ")
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
      <p className="text-gray-500 text-sm">Manage all employees and their permissions.</p>
      <div className="flex items-center gap-2 mb-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 py-0 flex items-center gap-1"
          aria-label="Refresh"
          onClick={handleRefresh}
        >
          <RefreshCw className={`w-4 h-4 transition-transform duration-200 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 py-0 flex items-center gap-1"
          aria-label="Export"
          onClick={exportToCSV}
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button
          size="sm"
          variant="default"
          className="h-7 px-2 py-0 flex items-center gap-1"
          aria-label="Add User"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Add User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              // Add new user to employees
              setEmployees(prev => [
                ...prev,
                {
                  id: prev.length ? Math.max(...prev.map(emp => emp.id)) + 1 : 1,
                  username: form.username,
                  email: form.email,
                  role: form.role,
                  status: "active",
                  permissions: [], // You can add a permissions selector if needed
                },
              ]);
              setForm({
                username: "",
                email: "",
                type: "Admin",
                role: "employee",
                password: "",
                confirmPassword: "",
              });
              setOpen(false);
            }}
            className="space-y-2"
          >
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Username</label>
              <Input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                className="h-7 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="h-7 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Type</label>
              <Input value="Admin" disabled className="bg-gray-100 h-7 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Role</label>
              <Select
                value={form.role}
                onValueChange={role => setForm(f => ({ ...f, role }))}
              >
                <SelectTrigger className="w-full h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                  <SelectItem value="employee" className="text-xs">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="h-7 text-xs pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  className="h-7 text-xs pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="default">
                Add User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-lg">Employees</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="p-1 text-xs">ID</TableHead>
                <TableHead className="p-1 text-xs">Username</TableHead>
                <TableHead className="p-1 text-xs">Email</TableHead>
                <TableHead className="p-1 text-xs">Role</TableHead>
                <TableHead className="p-1 text-xs">Status</TableHead>
                <TableHead className="p-1 text-xs">Permissions</TableHead>
                <TableHead className="p-1 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} className="h-8 text-xs">
                  <TableCell className="p-1 align-middle">{emp.id}</TableCell>
                  <TableCell className="p-1 align-middle">{emp.username}</TableCell>
                  <TableCell className="p-1 align-middle">{emp.email}</TableCell>
                  <TableCell className="p-1 align-middle">
                    <Badge className={emp.role === "admin" ? "bg-blue-100 text-blue-800 px-1 py-0.5 text-[9px] h-4 min-w-10" : "bg-purple-100 text-purple-800 px-1 py-0.5 text-[9px] h-4 min-w-10"}>
                      {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1 align-middle">
                    {getStatusBadge(emp.status)}
                  </TableCell>
                  <TableCell className="p-1 align-middle">
                    <div
                      className="max-w-[400px] truncate cursor-pointer"
                      title={emp.permissions.join(", ")}
                    >
                      {emp.permissions.join(", ")}
                    </div>
                  </TableCell>
                  <TableCell className="p-1 align-middle">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        className="h-6 px-2 py-0 text-[11px] flex items-center gap-1"
                        onClick={() => openPermModal(emp.id, emp.permissions)}
                      >
                        <Pencil className="w-3 h-3" />
                        Set Permissions
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setDeleteUserId(emp.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <span className="sr-only">Delete</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6m-6 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Set Permissions Modal */}
      <Dialog open={permModalOpen} onOpenChange={setPermModalOpen}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Set Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {ALL_PERMISSIONS.map(perm => (
              <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={permChecked.includes(perm)}
                  onChange={() => handlePermChange(perm)}
                  className="accent-blue-600 h-3 w-3"
                />
                {perm}
              </label>
            ))}
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setPermModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" variant="default" onClick={savePermissions}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Employee</DialogTitle>
          </DialogHeader>
          <div className="text-xs py-2">
            {(() => {
              const emp = employees.find(e => e.id === deleteUserId);
              if (!emp) return null;
              return (
                <span>
                  Are you sure you want to delete <b>{emp.username}</b> ({emp.email})?
                  <br />This action cannot be undone.
                </span>
              );
            })()}
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                setEmployees(prev => prev.filter(e => e.id !== deleteUserId));
                setDeleteModalOpen(false);
                setDeleteUserId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 