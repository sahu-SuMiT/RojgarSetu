import React, { useState, useEffect } from "react";
import AppLayout from "../components/layouts/AppLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Upload, Shield, FileText, Plus, Download, Eye } from "lucide-react";
import { toast } from "sonner";

// Define your backend API base URL here
const API_BASE_URL = 'http://localhost:5000'; // Replace with your actual backend API URL

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'missing' | 'rejected';
  lastUpdated: string;
  source: 'digi-kyc' | 'manual';
  kycId?: string;
  downloadUrl?: string;
}

interface VerificationTicket {
  id: string;
  studentName: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedFile?: File;
  created: string;
  description: string;
}

interface DigiKycRequest {
  identifier: string; // email or mobile
  template_name?: string;
}

interface StudentKyc {
  name: string;
  email: string;
  kycStatus: string;
  kycData?: {
    verificationId?: string;
    status?: string;
    lastUpdated?: string;
    [key: string]: any;
  };
}

const EKysDashboard = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "https://company.rojgarsetu.org/";
  }


  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Aadhaar Card",
      type: "Identity Proof",
      status: "verified",
      lastUpdated: "2024-01-15",
      source: "digi-kyc"
    },
    {
      id: "2",
      name: "10th Marksheet",
      type: "Educational Certificate",
      status: "verified",
      lastUpdated: "2024-01-10",
      source: "digi-kyc"
    },
    {
      id: "3",
      name: "12th Marksheet",
      type: "Educational Certificate",
      status: "missing",
      lastUpdated: "N/A",
      source: "digi-kyc"
    },
    {
      id: "4",
      name: "Degree Certificate",
      type: "Educational Certificate",
      status: "pending",
      lastUpdated: "2024-01-20",
      source: "manual"
    }
  ]);

  const [tickets, setTickets] = useState<VerificationTicket[]>([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    documentType: "",
    description: "",
    uploadedFile: null as File | null
  });
  const [kycData, setKycData] = useState({
    identifier: "",
    templateName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [students, setStudents] = useState<StudentKyc[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentKyc | null>(null);

  // Approve or Reject KYC Request
  const handleKycDecision = async (kycId: string, decision: 'approved' | 'rejected', reason?: string) => {
    setIsProcessing(true);
    try {
      console.log(`Handling KYC decision: ${decision} for KYC ID: ${kycId}`);
      const response = await fetch(`${API_BASE_URL}/api/kyc/decision`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: kycId,
          decision,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${decision} KYC request`);
      }

      // Update student KYC status
      setStudents(students.map(student =>
        student.kycData?.verificationId === kycId
          ? {
              ...student,
              kycStatus: data.kycStatus,
              kycData: data.kycData
            }
          : student
      ));

      toast.success(data.message);
    } catch (error: any) {
      console.error(`Error ${decision}ing KYC:`, error);
      toast.error(error.message || `Failed to ${decision} KYC request`);
    } finally {
      setIsProcessing(false);
      if (decision === 'rejected') {
        setIsRejectDialogOpen(false);
        setRejectReason("");
        setSelectedKycId(null);
      }
    }
  };

  // Open Reject Dialog
  const openRejectDialog = (kycId: string) => {
    setSelectedKycId(kycId);
    setIsRejectDialogOpen(true);
  };

  // Open View KYC Details Dialog
  const openViewDialog = (student: StudentKyc) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  // Initiate Digi KYC
  const initiateDigiKyc = async () => {
    if (!kycData.identifier) {
      toast.error("Please provide email or mobile number.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: kycData.identifier,
          template_name: kycData.templateName || "default"
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newDoc: Document = {
          id: `kyc-${Date.now()}`,
          name: "KYC Verification",
          type: "Identity Verification",
          status: "pending",
          lastUpdated: new Date().toISOString().split('T')[0],
          source: "digi-kyc",
          kycId: data.requestId
        };
        
        setDocuments([newDoc, ...documents]);
        setIsKycDialogOpen(false);
        setKycData({ identifier: "", templateName: "" });
        toast.success("KYC verification initiated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(`KYC initiation failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("KYC API Error:", error);
      toast.error("Error initiating KYC verification. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check KYC Status
  const checkKycStatus = async (kycId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(docs => docs.map(doc => 
          doc.kycId === kycId 
            ? { ...doc, status: data.kycStatus === 'verified' ? 'verified' : 'pending' }
            : doc
        ));
        toast.success("KYC status updated!");
      }
    } catch (error) {
      console.error("Error checking KYC status:", error);
      toast.error("Error checking KYC status.");
    }
  };

  // Download Document
  const downloadDocument = async (downloadUrl: string, fileName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download/${downloadUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Document downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Error downloading document.");
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.documentType || !newTicket.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const ticket: VerificationTicket = {
      id: `VT${Date.now()}`,
      studentName: "Alex Johnson",
      documentType: newTicket.documentType,
      status: "pending",
      uploadedFile: newTicket.uploadedFile ?? undefined,
      created: new Date().toISOString().split('T')[0],
      description: newTicket.description
    };

    setTickets([ticket, ...tickets]);
    setIsCreateTicketOpen(false);
    setNewTicket({
      documentType: "",
      description: "",
      uploadedFile: null
    });

    toast.success("Verification ticket created successfully!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewTicket({...newTicket, uploadedFile: file});
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Fetch All KYC Details
  useEffect(() => {
    const fetchAllKycDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/kyc/all-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const students = await response.json();
          setStudents(students);
        }
      } catch (error) {
        console.error('Error fetching all KYC details:', error);
      }
    };
    fetchAllKycDetails();
  }, [token]);

  // Dashboard card counts from students data
  const verifiedCount = students.filter(s => s.kycStatus === 'verified').length;
  const pendingCount = students.filter(s => s.kycStatus === 'pending').length;
  const rejectedCount = students.filter(s => s.kycStatus === 'rejected').length;
  const missingCount = students.filter(s => !s.kycStatus || s.kycStatus === 'missing').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">KYC Dashboard</h1>
            <p className="text-gray-500">Manage and verify your documents through DigiLocker</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsKycDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Start KYC
            </Button>
            <Button 
              onClick={() => setIsCreateTicketOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Verification Ticket
            </Button>
          </div>
        </div>

        {/* Document Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{verifiedCount}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{pendingCount}</h3>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejected KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{rejectedCount}</h3>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Missing KYC</p>
                  <h3 className="text-2xl font-bold mt-1">{missingCount}</h3>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students KYC Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Students KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verification ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .slice()
                    .sort((a, b) => {
                      // Custom sort: pending first, then verified, then not started/missing, then rejected
                      const statusOrder = (status: string | undefined) => {
                        if (status === 'pending') return 0;
                        if (status === 'verified') return 1;
                        if (!status || status === 'missing' || status === '') return 2;
                        return 3; // rejected or any other
                      };
                      const aOrder = statusOrder(a.kycStatus);
                      const bOrder = statusOrder(b.kycStatus);
                      if (aOrder !== bOrder) return aOrder - bOrder;
                      return 0;
                    })
                    .map((student, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{student.name}</td>
                        <td className="px-4 py-2">{student.email}</td>
                        <td className="px-4 py-2">
                          <Badge className={getStatusColor(student.kycStatus)}>
                            {student.kycStatus || 'missing'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{student.kycData?.verificationId || '-'}</td>
                        <td className="px-4 py-2">{student.kycData?.lastUpdated || '-'}</td>
                        <td className="px-4 py-2">
                          {student.kycStatus === 'pending' && student.kycData?.verificationId ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleKycDecision(student.kycData?.verificationId!, 'approved')}
                                disabled={isProcessing}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => openRejectDialog(student.kycData?.verificationId!)}
                                disabled={isProcessing}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => openViewDialog(student)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Verification Tickets */}
        {tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Ticket #{ticket.id}</h4>
                      <p className="text-sm text-gray-500">{ticket.documentType}</p>
                      <p className="text-xs text-gray-400">{ticket.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{ticket.created}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Digi KYC Dialog */}
      <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Initiate Digi KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <Input 
                id="identifier" 
                value={kycData.identifier}
                onChange={(e) => setKycData({...kycData, identifier: e.target.value})}
                placeholder="Enter email or mobile number" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Template Name (Optional)</Label>
              <Input 
                id="template" 
                value={kycData.templateName}
                onChange={(e) => setKycData({...kycData, templateName: e.target.value})}
                placeholder="Enter template name or leave empty for default" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsKycDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={initiateDigiKyc}
              disabled={!kycData.identifier || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Start KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject KYC Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject KYC Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectReason">Reason for Rejection</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejecting this KYC request"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setIsRejectDialogOpen(false);
              setRejectReason("");
              setSelectedKycId(null);
            }}>Cancel</Button>
            <Button
              onClick={() => selectedKycId && handleKycDecision(selectedKycId, 'reject', rejectReason)}
              disabled={!rejectReason || isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Reject KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View KYC Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>KYC Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm text-gray-600">{selectedStudent.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-gray-600">{selectedStudent.email}</p>
              </div>
              <div>
                <Label>KYC Status</Label>
                <p className="text-sm text-gray-600">{selectedStudent.kycStatus || 'missing'}</p>
              </div>
              <div>
                <Label>Verification ID</Label>
                <p className="text-sm text-gray-600">{selectedStudent.kycData?.verificationId || '-'}</p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm text-gray-600">{selectedStudent.kycData?.lastUpdated || '-'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              setSelectedStudent(null);
            }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Verification Ticket Dialog */}
      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Document Verification Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={newTicket.documentType}
                onValueChange={(value) => setNewTicket({...newTicket, documentType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                  <SelectItem value="PAN Card">PAN Card</SelectItem>
                  <SelectItem value="10th Marksheet">10th Marksheet</SelectItem>
                  <SelectItem value="12th Marksheet">12th Marksheet</SelectItem>
                  <SelectItem value="Degree Certificate">Degree Certificate</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-upload">Upload Document (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                {newTicket.uploadedFile && (
                  <span className="text-sm text-gray-600">{newTicket.uploadedFile.name}</span>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Describe your verification request or any issues you're facing" 
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCreateTicketOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTicket}
              disabled={!newTicket.documentType || !newTicket.description}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default EKysDashboard;