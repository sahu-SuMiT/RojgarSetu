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
import { CheckCircle, XCircle, AlertCircle, Upload, Shield, FileText, Plus, Download, Eye, History } from "lucide-react";
import { toast } from "sonner";
//backend API base URL'

const API_BASE_URL = 'http://localhost:5000';

type Document = {
  type: string;
  status: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
};

type KycData = {
  verificationId?: string;
  lastUpdated?: string;
  [key: string]: any;
};

type Student = {
  name: string;
  email: string;
  kycStatus?: string;
  kycData?: KycData;
  documents?: Document[];
  [key: string]: any;
};

const EKysDashboard = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "https://company.rojgarsetu.org/";
  }

  const [studentDocuments, setStudentDocuments] = useState<Document[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [isReinitiateKycDialogOpen, setIsReinitiateKycDialogOpen] = useState(false);
  const [isKycHistoryDialogOpen, setIsKycHistoryDialogOpen] = useState(false);
  const [kycHistory, setKycHistory] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({
    documentType: "",
    description: "",
    uploadedFile: null
  });
  const [kycData, setKycData] = useState({
    identifier: "",
    templateName: ""
  });
  const [reinitiateKycData, setReinitiateKycData] = useState({
    identifier: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch student documents
  useEffect(() => {
    const fetchStudentDocuments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/kyc/student/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudentDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('Error fetching student documents:', error);
      }
    };
    fetchStudentDocuments();
  }, [token]);

  // Fetch all KYC details
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

  // Fetch KYC history
  useEffect(() => {
    const fetchKycHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/kyc/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setKycHistory(data);
        }
      } catch (error) {
        console.error('Error fetching KYC history:', error);
      }
    };
    fetchKycHistory();
  }, [token]);

  const handleKycDecision = async (kycId, decision, reason) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/decision`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: kycId,
          decision,
          ...(reason && { reason })
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${decision} KYC request`);
      }

      setStudents(students.map(student =>
        student.kycData?.verificationId === kycId
          ? { ...student, kycStatus: data.kycStatus, kycData: data.kycData }
          : student
      ));

      toast.success(data.message);
    } catch (error) {
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

  const openRejectDialog = (kycId) => {
    setSelectedKycId(kycId);
    setIsRejectDialogOpen(true);
  };

  const openViewDialog = (student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

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
          template_name: kycData.templateName || "KYC_CLIENT"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsKycDialogOpen(false);
        setKycData({ identifier: "", templateName: "" });
        toast.success("KYC verification initiated successfully!");
        window.location.href = data.digilockerUrl;
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

  const reinitiateDigiKyc = async () => {
    if (!reinitiateKycData.identifier) {
      toast.error("Please provide email or mobile number.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/kyc/reinitiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: reinitiateKycData.identifier
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsReinitiateKycDialogOpen(false);
        setReinitiateKycData({ identifier: "" });
        toast.success("KYC re-verification initiated successfully!");
        window.location.href = data.digilockerUrl;
      } else {
        const errorData = await response.json();
        toast.error(`KYC re-initiation failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("KYC Re-initiation Error:", error);
      toast.error("Error re-initiating KYC verification. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.documentType || !newTicket.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const ticket = {
      id: `VT${Date.now()}`,
      studentName: "Alex Johnson",
      documentType: newTicket.documentType,
      status: "pending",
      uploadedFile: newTicket.uploadedFile,
      created: new Date().toISOString().split('T')[0],
      description: newTicket.description
    };

    setTickets([ticket, ...tickets]);
    setIsCreateTicketOpen(false);
    setNewTicket({ documentType: "", description: "", uploadedFile: null });
    toast.success("Verification ticket created successfully!");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewTicket({ ...newTicket, uploadedFile: file });
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const verifiedCount = students.filter(s => s.kycStatus === 'verified').length;
  const pendingCount = students.filter(s => s.kycStatus === 'pending' || s.kycStatus === 'pending approval').length;
  const rejectedCount = students.filter(s => s.kycStatus === 'rejected').length;
  const missingCount = students.filter(s => !s.kycStatus || s.kycStatus === 'missing' || s.kycStatus === 'not started').length;

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
              onClick={() => setIsReinitiateKycDialogOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Re-initiate KYC
            </Button>
            <Button 
              onClick={() => setIsKycHistoryDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              View KYC History
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

        <Card>
          <CardHeader>
            <CardTitle>Student Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentDocuments.map((doc, index) => (
                <div key={index} className="flex flex-col p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{doc.type}</h4>
                      <p className="text-sm text-gray-500">Status: {doc.status}</p>
                      {doc.metadata?.kycId && (
                        <p className="text-sm text-gray-500">KYC ID: {doc.metadata.kycId}</p>
                      )}
                      {doc.metadata?.source && (
                        <p className="text-sm text-gray-500">Source: {doc.metadata.source}</p>
                      )}
                      {doc.metadata?.lastUpdated && (
                        <p className="text-sm text-gray-500">Last Updated: {doc.metadata.lastUpdated}</p>
                      )}
                      {/* Display additional metadata fields */}
                      {Object.entries(doc.metadata || {}).filter(([key]) => !['kycId', 'source', 'lastUpdated'].includes(key)).map(([key, value]) => (
                        <p key={key} className="text-sm text-gray-500">{key}: {JSON.stringify(value)}</p>
                      ))}
                    </div>
                    {doc.imageUrl && (
                      <a href={doc.imageUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                      const statusOrder = (status) => {
                        if (status === 'pending' || status === 'pending approval') return 0;
                        if (status === 'verified') return 1;
                        if (!status || status === 'missing' || status === 'not started') return 2;
                        return 3;
                      };
                      const aOrder = statusOrder(a.kycStatus);
                      const bOrder = statusOrder(b.kycStatus);
                      return aOrder !== bOrder ? aOrder - bOrder : 0;
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
                          {student.kycStatus === 'pending' || student.kycStatus === 'pending approval' && student.kycData?.verificationId ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleKycDecision(student.kycData?.verificationId, 'approved', '')}
                                disabled={isProcessing}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => openRejectDialog(student.kycData?.verificationId)}
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

      <Dialog open={isReinitiateKycDialogOpen} onOpenChange={setIsReinitiateKycDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Re-initiate Digi KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reinitiate-identifier">Email or Mobile Number</Label>
              <Input 
                id="reinitiate-identifier" 
                value={reinitiateKycData.identifier}
                onChange={(e) => setReinitiateKycData({...reinitiateKycData, identifier: e.target.value})}
                placeholder="Enter email or mobile number" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReinitiateKycDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={reinitiateDigiKyc}
              disabled={!reinitiateKycData.identifier || isProcessing}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isProcessing ? "Processing..." : "Re-initiate KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isKycHistoryDialogOpen} onOpenChange={setIsKycHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>KYC Verification History</DialogTitle>
          </DialogHeader>
          {kycHistory ? (
            <div className="grid gap-4 py-4">
              <div>
                <Label>KYC Status</Label>
                <p className="text-sm text-gray-600">{kycHistory.kycStatus}</p>
              </div>
              <div>
                <Label>Verification ID</Label>
                <p className="text-sm text-gray-600">{kycHistory.kycData?.verificationId || '-'}</p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm text-gray-600">{kycHistory.lastUpdated || '-'}</p>
              </div>
              <div>
                <Label>Documents</Label>
                <ul className="text-sm text-gray-600">
                  {kycHistory.documents?.map((doc, idx) => (
                    <li key={idx} className="mb-2">
                      <p>{doc.type} - {doc.status}</p>
                      {doc.metadata?.kycId && (
                        <p className="text-xs">KYC ID: {doc.metadata.kycId}</p>
                      )}
                      {doc.metadata?.source && (
                        <p className="text-xs">Source: {doc.metadata.source}</p>
                      )}
                      {doc.metadata?.lastUpdated && (
                        <p className="text-xs">Last Updated: {doc.metadata.lastUpdated}</p>
                      )}
                      {Object.entries(doc.metadata || {}).filter(([key]) => !['kycId', 'source', 'lastUpdated'].includes(key)).map(([key, value]) => (
                        <p key={key} className="text-xs">{key}: {JSON.stringify(value)}</p>
                      ))}
                      {doc.imageUrl && (
                        <a href={doc.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No KYC history available.</p>
          )}
          <DialogFooter>
            <Button onClick={() => setIsKycHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={() => selectedKycId && handleKycDecision(selectedKycId, 'rejected', rejectReason)}
              disabled={!rejectReason || isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Reject KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div>
                <Label>Documents</Label>
                <ul className="text-sm text-gray-600">
                  {selectedStudent.documents?.map((doc, idx) => (
                    <li key={idx} className="mb-2">
                      <p>{doc.type} - {doc.status}</p>
                      {doc.metadata?.kycId && (
                        <p className="text-xs">KYC ID: {doc.metadata.kycId}</p>
                      )}
                      {doc.metadata?.source && (
                        <p className="text-xs">Source: {doc.metadata.source}</p>
                      )}
                      {doc.metadata?.lastUpdated && (
                        <p className="text-xs">Last Updated: {doc.metadata.lastUpdated}</p>
                      )}
                      {Object.entries(doc.metadata || {}).filter(([key]) => !['kycId', 'source', 'lastUpdated'].includes(key)).map(([key, value]) => (
                        <p key={key} className="text-xs">{key}: {JSON.stringify(value)}</p>
                      ))}
                      {doc.imageUrl && (
                        <a href={doc.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
                      )}
                    </li>
                  ))}
                </ul>
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