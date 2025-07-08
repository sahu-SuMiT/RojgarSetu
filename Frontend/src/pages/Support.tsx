import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MessageSquare, CheckCircle, AlertCircle, Plus, Upload, Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
const backendUrl = import.meta.env.VITE_API_URL;

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in-progress" | "resolved" | "closed" | "pending" | "active";
type Category = "technical" | "billing" | "general" | "feature_request" | "bug_report";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: Category;
  created: string;
  lastUpdated: string;
  responses: number;
  uploadedFile?: File;
  email?: string;
  phone?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Support = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "https://company.rojgarsetu.org/";
  }

  const userName = localStorage.getItem("userName");

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TICK-001",
      title: "Login Issues with Student Portal",
      description: "Unable to access student portal after password reset",
      priority: "high",
      status: "open",
      category: "Technical",
      created: "2024-01-20",
      lastUpdated: "2024-01-20",
      responses: 0
    },
    {
      id: "TICK-002", 
      title: "Grade Discrepancy in Mathematics",
      description: "There seems to be an error in my final grade calculation",
      priority: "medium",
      status: "in-progress",
      category: "Academic",
      created: "2024-01-18",
      lastUpdated: "2024-01-19",
      responses: 2
    },
    {
      id: "TICK-003",
      title: "Library Access Card Not Working",
      description: "My student ID card is not scanning at the library entrance",
      priority: "low",
      status: "resolved",
      category: "Facilities",
      created: "2024-01-15",
      lastUpdated: "2024-01-17",
      responses: 1
    }
  ]);

  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "general" as Category,
    uploadedFile: null as File | null
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [secretCode, setSecretCode] = useState("");
  const [activeTab, setActiveTab] = useState<Category | "all">("all");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const userName = localStorage.getItem("userName");
        let url = `${API_URL}/api/sales/support-tickets`;
        if (userName && userName.trim().toLowerCase() === "senior manager") {
          url = `${API_URL}/api/sales/manager-support-tickets`;
        }
        const res = await axios.get(
          url,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTickets(res.data.map((t: any) => ({
          ...t,
          id: t.ticketId || t._id,
          email: t.email,
          phone: t.phone,
          status: t.assignedTo ? t.status : "pending",
          category: t.category || "general"
        })));
      } catch (err) {
        toast.error("Failed to fetch support tickets");
      }
    };
    fetchTickets();
  }, [token]);

const handleCreateTicket = async () => {
  const { title, description, category, priority, uploadedFile } = newTicket;

  // Step 1: Validate input
  if (!title || !description || !category || !priority) {
    toast.error("Please fill in all required fields.");
    return;
  }

    setTickets([ticket, ...tickets]);
    setIsCreateTicketOpen(false);
    setNewTicket({
      title: "",
      description: "",
      priority: "medium",
      category: "general",
      uploadedFile: null
    });

  try {
    // Step 2: Prepare FormData for backend (because of file upload)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("status", "open"); // default or dynamic
    formData.append("category", category);
    formData.append("uploadedFile", uploadedFile); // File object


    const res = await axios.post(`${backendUrl}/api/support-ticket/`,  formData,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

    toast.success("Ticket created successfully!");
    console.log("Response:", res.data);
  } catch (err) {
    console.error("Create Ticket Error:", err);
    toast.error("Failed to create ticket. Try again later.");
  }
};


  const handleSecretCodeSubmit = (ticketId: string) => {
    if (secretCode === "YOUR_SECRET_CODE") {
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: "active" } : ticket
      ));
      toast.success("Ticket marked as active!");
    } else {
      toast.error("Invalid secret code.");
    }
  };


const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setNewTicket((prev) => ({
      ...prev,
      uploadedFile: file,
    }));
  }
};

  const filteredTickets = tickets.filter(ticket => {
    const title = ticket.title || "";
    const description = ticket.description || "";
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
    const matchesCategory = activeTab === "all" || ticket.category === activeTab;
    const excludeMediumClosed = !(ticket.priority === "medium" && ticket.status === "closed");

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && excludeMediumClosed;
  });

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'closed': return <CheckCircle className="h-5 w-5 text-gray-600" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'active': return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const categoryCounts = {
    all: tickets.length,
    technical: tickets.filter(t => t.category === 'technical').length,
    billing: tickets.filter(t => t.category === 'billing').length,
    general: tickets.filter(t => t.category === 'general').length,
    feature_request: tickets.filter(t => t.category === 'feature_request').length,
    bug_report: tickets.filter(t => t.category === 'bug_report').length
  };

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  // You can calculate avg response time if you have that data, or leave as static/dummy

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Support Center</h1>
            <p className="text-gray-600 mt-2">Manage and track your support tickets with ease</p>
          </div>
          <Button 
            onClick={() => setIsCreateTicketOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Ticket
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Open Tickets', count: openCount, icon: AlertCircle, color: 'text-red-500' },
            { label: 'In Progress', count: inProgressCount, icon: Clock, color: 'text-yellow-500' },
            { label: 'Resolved', count: resolvedCount, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Avg Response Time', count: '4h', icon: MessageSquare, color: 'text-blue-500' }
          ].map((stat, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.count}</h3>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Search tickets by title or description..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-gray-50">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40 bg-gray-50">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List with Category Tabs */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Your Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Category | "all")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2 bg-gray-100 p-2 rounded-lg">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All <Badge>{categoryCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-2">
                  Technical <Badge>{categoryCounts.technical}</Badge>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  Billing <Badge>{categoryCounts.billing}</Badge>
                </TabsTrigger>
                <TabsTrigger value="general" className="flex items-center gap-2">
                  General <Badge>{categoryCounts.general}</Badge>
                </TabsTrigger>
                <TabsTrigger value="feature_request" className="flex items-center gap-2">
                  Feature <Badge>{categoryCounts.feature_request}</Badge>
                </TabsTrigger>
                <TabsTrigger value="bug_report" className="flex items-center gap-2">
                  Bug <Badge>{categoryCounts.bug_report}</Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(ticket.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">#{ticket.id}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500 capitalize">{ticket.category}</span>
                            {ticket.email && (
                              <>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-blue-600">{ticket.email}</span>
                              </>
                            )}
                            {ticket.phone && (
                              <>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-blue-600">{ticket.phone}</span>
                              </>
                            )}
                            {ticket.uploadedFile && (
                              <>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-blue-600">📎 {ticket.uploadedFile.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-4 md:mt-0">
                        <Badge className={`${getPriorityColor(ticket.priority)} capitalize`}>{ticket.priority}</Badge>
                        <Badge className={`${getStatusColor(ticket.status)} capitalize`}>{ticket.status}</Badge>
                        <div className="text-right text-sm text-gray-500">
                          <div>{ticket.lastUpdated}</div>
                          <div>{ticket.responses} responses</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!ticket.evaluation}
                            onChange={async (e) => {
                              const newValue = e.target.checked;
                              try {
                                await axios.post(`${API_URL}/api/sales/ticket/evaluation`, {
                                  ticketId: ticket._id || ticket.id,
                                  evaluation: newValue,
                                }, { headers: { Authorization: `Bearer ${token}` } });
                                setTickets(tickets =>
                                  tickets.map(t =>
                                    t.id === ticket.id ? { ...t, evaluation: newValue } : t
                                  )
                                );
                                toast.success(
                                  newValue ? "Marked as under evaluation!" : "Marked as not evaluated!"
                                );
                              } catch {
                                toast.error("Failed to update evaluation status");
                              }
                            }}
                          />
                          <span className={ticket.evaluation ? "text-green-600 font-semibold" : "text-gray-500"}>
                            {ticket.evaluation ? "Under Evaluation" : "Not Evaluated"}
                          </span>
                        </div>
                        <Button
                          className="bg-green-600 hover:bg-green-700 ml-2"
                          onClick={async () => {
                            const code = prompt("Enter secret code to mark as resolved:");
                            if (!code) return;
                            try {
                              const res = await axios.post(`${API_URL}/api/sales/ticket/resolve`, {
                                ticketId: ticket._id || ticket.id,
                                secretCode: code,
                              }, { headers: { Authorization: `Bearer ${token}` } });
                              setTickets(tickets =>
                                tickets.map(t =>
                                  t.id === ticket.id ? { ...t, status: "resolved" } : t
                                )
                              );
                              toast.success("Ticket marked as resolved!");
                            } catch (err: any) {
                              toast.error(err?.response?.data?.message || "Failed to mark as resolved");
                            }
                          }}
                        >
                          Mark as Resolved
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tickets found in this category.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Create Ticket Dialog */}
        <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-gray-700">Title</Label>
                <Input 
                  id="title" 
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  placeholder="Brief description of your issue" 
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-gray-700">Category</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value: Category) => setNewTicket({...newTicket, category: value})}
                  >
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issues</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="priority" className="text-gray-700">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value: Priority) => setNewTicket({...newTicket, priority: value})}
                  >
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file-upload" className="text-gray-700">Attach File (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-100"
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
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Textarea 
                  id="description" 
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  placeholder="Provide detailed information about your issue" 
                  rows={5}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateTicketOpen(false)}
                className="border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTicket}
                disabled={!newTicket.title || !newTicket.description || !newTicket.category}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Support;