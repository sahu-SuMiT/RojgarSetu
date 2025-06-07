import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Ticket, 
  MessageSquare, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  Search,
  Send,
  Phone,
  Eye,
  Edit,
  Trash2,
  Filter
} from "lucide-react";
import "./SupportPanel.css";

export function SupportPanel() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatStatusFilter, setChatStatusFilter] = useState("all");
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
    userEmail: ""
  });
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: ""
  });

  const supportStats = [
    {
      title: "Open Tickets",
      value: "24",
      change: "+3",
      icon: Ticket,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "In Progress",
      value: "18",
      change: "+5",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Resolved Today",
      value: "42",
      change: "+15",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      change: "-0.3h",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  const supportTickets = [
    {
      id: "TKT-001",
      user: "rahul.sharma@email.com",
      userType: "Student",
      subject: "Unable to upload resume",
      priority: "high",
      status: "open",
      created: "2024-01-28 10:30 AM",
      lastUpdate: "2024-01-28 11:15 AM",
      assignedTo: "Support Agent 1",
      description: "User is facing issues while uploading resume. Error message appears when trying to upload PDF files."
    },
    {
      id: "TKT-002",
      user: "hr@techcorp.com",
      userType: "Company",
      subject: "Job posting not visible",
      priority: "medium",
      status: "in_progress",
      created: "2024-01-28 09:15 AM",
      lastUpdate: "2024-01-28 10:45 AM",
      assignedTo: "Support Agent 2",
      description: "Company cannot see their job posting on the platform after submission."
    },
    {
      id: "TKT-003",
      user: "admin@university.edu",
      userType: "College",
      subject: "Student verification issues",
      priority: "high",
      status: "open",
      created: "2024-01-28 08:45 AM",
      lastUpdate: "2024-01-28 09:30 AM",
      assignedTo: "Support Agent 1",
      description: "Multiple students from the college are facing verification issues with their academic credentials."
    },
    {
      id: "TKT-004",
      user: "priya.patel@email.com",
      userType: "Student",
      subject: "Login authentication error",
      priority: "low",
      status: "resolved",
      created: "2024-01-27 04:20 PM",
      lastUpdate: "2024-01-28 08:15 AM",
      assignedTo: "Support Agent 3",
      description: "User was unable to login due to authentication errors. Issue resolved by password reset."
    },
  ];

  const liveChats = [
    {
      id: 1,
      user: "john.doe@email.com",
      userType: "Student",
      status: "active",
      duration: "5 min",
      issue: "Password reset help",
    },
    {
      id: 2,
      user: "company@startup.com",
      userType: "Company",
      status: "waiting",
      duration: "2 min",
      issue: "Profile verification",
    },
    {
      id: 3,
      user: "college@university.edu",
      userType: "College",
      status: "active",
      duration: "12 min",
      issue: "Student bulk upload",
    },
    {
      id: 4,
      user: "student@example.com",
      userType: "Student",
      status: "waiting",
      duration: "1 min",
      issue: "Application status query",
    },
  ];

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesUserType = userTypeFilter === "all" || ticket.userType === userTypeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesUserType;
  });

  const filteredChats = liveChats.filter((chat) => {
    const matchesSearch = chat.user.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                         chat.issue.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                         chat.userType.toLowerCase().includes(chatSearchQuery.toLowerCase());
    const matchesStatus = chatStatusFilter === "all" || chat.status === chatStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setUserTypeFilter("all");
    setChatSearchQuery("");
    setChatStatusFilter("all");
    toast({
      title: "Filters Cleared",
      description: "All search and filter criteria have been reset",
    });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge className="priority-badge priority-high">High</Badge>;
      case "medium":
        return <Badge className="priority-badge priority-medium">Medium</Badge>;
      case "low":
        return <Badge className="priority-badge priority-low">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <Badge className="status-badge status-open">Open</Badge>;
      case "in_progress":
        return <Badge className="status-badge status-progress">In Progress</Badge>;
      case "resolved":
        return <Badge className="status-badge status-resolved">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getChatStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="chat-badge chat-active">Active</Badge>;
      case "waiting":
        return <Badge className="chat-badge chat-waiting">Waiting</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleCreateTicket = () => {
    console.log("Creating ticket:", newTicket);
    toast({
      title: "Ticket Created",
      description: `Ticket created successfully for ${newTicket.userEmail}`,
    });
    setNewTicket({ subject: "", description: "", priority: "medium", userEmail: "" });
    setIsCreateTicketOpen(false);
  };

  const handleSendEmail = () => {
    console.log("Sending email:", emailData);
    toast({
      title: "Email Sent",
      description: `Email sent successfully to ${emailData.to}`,
    });
    setEmailData({ to: "", subject: "", message: "" });
    setIsEmailDialogOpen(false);
  };

  const handleJoinChat = (chatId) => {
    console.log("Joining chat:", chatId);
    toast({
      title: "Joined Chat",
      description: `Connected to chat session #${chatId}`,
    });
  };

  const handleCallCenter = () => {
    console.log("Opening call center");
    toast({
      title: "Call Center",
      description: "Connecting to call center system...",
    });
  };

  const handleLiveChat = () => {
    setIsLiveChatOpen(true);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    console.log("Updating ticket status:", ticketId, newStatus);
    toast({
      title: "Status Updated",
      description: `Ticket ${ticketId} status changed to ${newStatus}`,
    });
  };

  const handleDeleteTicket = (ticketId) => {
    console.log("Deleting ticket:", ticketId);
    toast({
      title: "Ticket Deleted",
      description: `Ticket ${ticketId} has been deleted`,
      variant: "destructive"
    });
  };

  const handleSystemAlert = () => {
    console.log("Creating system alert");
    toast({
      title: "System Alert",
      description: "System alert broadcast to all users",
    });
  };

  return (
    <div className="support-panel">
      <div className="support-header">
        <div className="header-content">
          <h1 className="main-title">Support Panel</h1>
          <p className="subtitle">Manage user support and assistance</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={clearAllFilters} className="action-btn">
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <Button className="primary-btn" onClick={handleLiveChat}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        {supportStats.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardContent className="stat-content">
              <div className="stat-info">
                <div className="stat-text">
                  <p className="stat-label">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-change">{stat.change} from yesterday</p>
                </div>
                <div className={`stat-icon ${stat.bgColor}`}>
                  <stat.icon className={`icon ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="main-content">
        <div className="content-left">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Support Dashboard</CardTitle>
              <CardDescription>Manage tickets and live support</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tickets" className="dashboard-tabs">
                <TabsList className="tabs-list">
                  <TabsTrigger value="tickets" className="tab-trigger">
                    <Ticket className="w-4 h-4" />
                    <span>Tickets</span>
                  </TabsTrigger>
                  <TabsTrigger value="live-chat" className="tab-trigger">
                    <MessageSquare className="w-4 h-4" />
                    <span>Live Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="tab-trigger">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="tickets-content">
                  <div className="filters-section">
                    <div className="search-box">
                      <div className="search-input">
                        <Search className="search-icon" />
                        <Input 
                          placeholder="Search tickets by ID, user, or subject..." 
                          className="search-field" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="filter-row">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="User Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Company">Company</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="filter-info">
                      <p className="result-count">
                        Showing {filteredTickets.length} of {supportTickets.length} tickets
                      </p>
                      {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || userTypeFilter !== "all") && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </div>

                  <Table className="tickets-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="empty-state">
                            <div className="empty-content">
                              <Search className="empty-icon" />
                              <p className="empty-text">No tickets found matching your criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket) => (
                          <TableRow key={ticket.id} className="ticket-row">
                            <TableCell className="ticket-id">{ticket.id}</TableCell>
                            <TableCell>
                              <div className="user-cell">
                                <p className="user-email">{ticket.user}</p>
                                <p className="user-type">{ticket.userType}</p>
                              </div>
                            </TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>{ticket.lastUpdate}</TableCell>
                            <TableCell>
                              <div className="action-buttons">
                                <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Select onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}>
                                  <SelectTrigger className="action-select">
                                    <Edit className="w-3 h-3" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete ticket {ticket.id}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteTicket(ticket.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="live-chat" className="chat-content">
                  <div className="chat-filters">
                    <div className="chat-search">
                      <div className="search-input">
                        <Search className="search-icon" />
                        <Input 
                          placeholder="Search chats by user, issue, or type..." 
                          className="search-field" 
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={chatStatusFilter} onValueChange={setChatStatusFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="Chat Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="chat-info">
                      <p className="result-count">
                        {filteredChats.length} active chat sessions
                      </p>
                      {(chatSearchQuery || chatStatusFilter !== "all") && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setChatSearchQuery("");
                          setChatStatusFilter("all");
                        }}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="chat-list">
                    <h3 className="chat-title">Active Chats</h3>
                    {filteredChats.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-content">
                          <MessageSquare className="empty-icon" />
                          <p className="empty-text">No active chats found matching your criteria</p>
                        </div>
                      </div>
                    ) : (
                      filteredChats.map((chat) => (
                        <div key={chat.id} className="chat-item">
                          <div className="chat-details">
                            <div className="chat-user">
                              <User className="user-icon" />
                              <div className="user-info">
                                <p className="user-email">{chat.user}</p>
                                <p className="user-meta">{chat.userType} • {chat.issue}</p>
                              </div>
                            </div>
                            <div className="chat-actions">
                              {getChatStatusBadge(chat.status)}
                              <span className="chat-duration">{chat.duration}</span>
                              <Button size="sm" onClick={() => handleJoinChat(chat.id)}>Join</Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="email" className="email-content">
                  <div className="email-center">
                    <Mail className="email-icon" />
                    <h3 className="email-title">Email Support</h3>
                    <p className="email-description">Send support emails directly to users</p>
                    <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="compose-btn">
                          <Send className="w-4 h-4 mr-2" />
                          Compose Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="email-dialog">
                        <DialogHeader>
                          <DialogTitle>Compose Email</DialogTitle>
                          <DialogDescription>Send an email to users or support team</DialogDescription>
                        </DialogHeader>
                        <div className="email-form">
                          <div className="form-field">
                            <Label htmlFor="email-to">To</Label>
                            <Input
                              id="email-to"
                              placeholder="user@example.com"
                              value={emailData.to}
                              onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                            />
                          </div>
                          <div className="form-field">
                            <Label htmlFor="email-subject">Subject</Label>
                            <Input
                              id="email-subject"
                              placeholder="Email subject"
                              value={emailData.subject}
                              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                            />
                          </div>
                          <div className="form-field">
                            <Label htmlFor="email-message">Message</Label>
                            <Textarea
                              id="email-message"
                              placeholder="Type your message here"
                              value={emailData.message}
                              onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                              rows={5}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleSendEmail}>Send Email</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="sidebar">
          <Card className="quick-actions-card">
            <CardHeader>
              <CardTitle className="card-title">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="quick-actions">
              <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="action-button">
                    <Ticket className="w-4 h-4 mr-2" />
                    Create New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="ticket-dialog">
                  <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>Create a support ticket for a user</DialogDescription>
                  </DialogHeader>
                  <div className="ticket-form">
                    <div className="form-field">
                      <Label htmlFor="user-email">User Email</Label>
                      <Input
                        id="user-email"
                        placeholder="user@example.com"
                        value={newTicket.userEmail}
                        onChange={(e) => setNewTicket({...newTicket, userEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="ticket-subject">Subject</Label>
                      <Input
                        id="ticket-subject"
                        placeholder="Ticket subject"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="ticket-priority">Priority</Label>
                      <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-field">
                      <Label htmlFor="ticket-description">Description</Label>
                      <Textarea
                        id="ticket-description"
                        placeholder="Describe the issue"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTicket}>Create Ticket</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isLiveChatOpen} onOpenChange={setIsLiveChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="action-button">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Live Chat
                  </Button>
                </DialogTrigger>
                <DialogContent className="chat-dialog">
                  <DialogHeader>
                    <DialogTitle>Live Chat Dashboard</DialogTitle>
                    <DialogDescription>Monitor and join active chat sessions</DialogDescription>
                  </DialogHeader>
                  <div className="chat-dashboard">
                    <p className="chat-count">Active chat sessions: {liveChats.length}</p>
                    {liveChats.map((chat) => (
                      <div key={chat.id} className="chat-preview">
                        <div className="chat-preview-content">
                          <div className="preview-info">
                            <p className="preview-user">{chat.user}</p>
                            <p className="preview-issue">{chat.issue}</p>
                          </div>
                          <Button size="sm" onClick={() => handleJoinChat(chat.id)}>Join</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setIsLiveChatOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="action-button" onClick={() => setIsEmailDialogOpen(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Email
              </Button>
              <Button variant="outline" className="action-button" onClick={handleSystemAlert}>
                <AlertCircle className="w-4 h-4 mr-2" />
                System Alert
              </Button>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardHeader>
              <CardTitle className="card-title">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent className="knowledge-content">
              <div className="knowledge-section">
                <h4 className="section-title">Popular Articles</h4>
                <ul className="article-list">
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: How to reset password"})}>How to reset password</li>
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: Upload resume guide"})}>Upload resume guide</li>
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: Company verification process"})}>Company verification process</li>
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: Student profile setup"})}>Student profile setup</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="metrics-card">
            <CardHeader>
              <CardTitle className="card-title">Support Metrics</CardTitle>
            </CardHeader>
            <CardContent className="metrics-content">
              <div className="metric-item">
                <span className="metric-label">Resolution Rate</span>
                <span className="metric-value">94.2%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Satisfaction Score</span>
                <span className="metric-value">4.8/5</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">First Response</span>
                <span className="metric-value">&lt; 1 hour</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="ticket-detail-dialog">
          <DialogHeader>
            <DialogTitle>Ticket Details - {selectedTicket?.id}</DialogTitle>
            <DialogDescription>View and manage ticket information</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="ticket-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <Label>User</Label>
                  <p className="detail-value">{selectedTicket.user}</p>
                </div>
                <div className="detail-item">
                  <Label>User Type</Label>
                  <p className="detail-value">{selectedTicket.userType}</p>
                </div>
                <div className="detail-item">
                  <Label>Priority</Label>
                  <div className="detail-badge">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div className="detail-item">
                  <Label>Status</Label>
                  <div className="detail-badge">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div className="detail-item">
                  <Label>Created</Label>
                  <p className="detail-value">{selectedTicket.created}</p>
                </div>
                <div className="detail-item">
                  <Label>Last Update</Label>
                  <p className="detail-value">{selectedTicket.lastUpdate}</p>
                </div>
              </div>
              <div className="detail-full">
                <Label>Subject</Label>
                <p className="detail-value">{selectedTicket.subject}</p>
              </div>
              <div className="detail-full">
                <Label>Description</Label>
                <p className="detail-value">{selectedTicket.description}</p>
              </div>
              <div className="detail-full">
                <Label>Assigned To</Label>
                <p className="detail-value">{selectedTicket.assignedTo}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
            <Button onClick={() => toast({title: "Updated", description: "Ticket updated successfully"})}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}