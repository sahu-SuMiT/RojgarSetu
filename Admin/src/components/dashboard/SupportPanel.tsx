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

// TypeScript interfaces
interface SupportStat {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface SupportTicket {
  id: string;
  user: string;
  userType: "Student" | "Company" | "College";
  subject: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  created: string;
  lastUpdate: string;
  assignedTo: string;
  description: string;
}

interface LiveChat {
  id: number;
  user: string;
  userType: "Student" | "Company" | "College";
  status: "active" | "waiting";
  duration: string;
  issue: string;
}

interface NewTicket {
  subject: string;
  description: string;
  priority: string;
  userEmail: string;
}

interface EmailData {
  to: string;
  subject: string;
  message: string;
}

export function SupportPanel(): JSX.Element {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
  const [chatStatusFilter, setChatStatusFilter] = useState<string>("all");
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState<boolean>(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState<boolean>(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState<NewTicket>({
    subject: "",
    description: "",
    priority: "medium",
    userEmail: ""
  });
  const [emailData, setEmailData] = useState<EmailData>({
    to: "",
    subject: "",
    message: ""
  });

  const supportStats: SupportStat[] = [
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

  const supportTickets: SupportTicket[] = [
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

  const liveChats: LiveChat[] = [
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

  const filteredTickets: SupportTicket[] = supportTickets.filter((ticket: SupportTicket) => {
    const matchesSearch: boolean = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus: boolean = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority: boolean = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesUserType: boolean = userTypeFilter === "all" || ticket.userType === userTypeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesUserType;
  });

  const filteredChats: LiveChat[] = liveChats.filter((chat: LiveChat) => {
    const matchesSearch: boolean = chat.user.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                         chat.issue.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                         chat.userType.toLowerCase().includes(chatSearchQuery.toLowerCase());
    const matchesStatus: boolean = chatStatusFilter === "all" || chat.status === chatStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearAllFilters = (): void => {
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

  const getPriorityBadge = (priority: string): JSX.Element => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case "open":
        return <Badge className="bg-red-100 text-red-800">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getChatStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "waiting":
        return <Badge className="bg-yellow-100 text-yellow-800">Waiting</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleCreateTicket = (): void => {
    console.log("Creating ticket:", newTicket);
    toast({
      title: "Ticket Created",
      description: `Ticket created successfully for ${newTicket.userEmail}`,
    });
    setNewTicket({ subject: "", description: "", priority: "medium", userEmail: "" });
    setIsCreateTicketOpen(false);
  };

  const handleSendEmail = (): void => {
    console.log("Sending email:", emailData);
    toast({
      title: "Email Sent",
      description: `Email sent successfully to ${emailData.to}`,
    });
    setEmailData({ to: "", subject: "", message: "" });
    setIsEmailDialogOpen(false);
  };

  const handleJoinChat = (chatId: number): void => {
    console.log("Joining chat:", chatId);
    toast({
      title: "Joined Chat",
      description: `Connected to chat session #${chatId}`,
    });
  };

  const handleCallCenter = (): void => {
    console.log("Opening call center");
    toast({
      title: "Call Center",
      description: "Connecting to call center system...",
    });
  };

  const handleLiveChat = (): void => {
    setIsLiveChatOpen(true);
  };

  const handleViewTicket = (ticket: SupportTicket): void => {
    setSelectedTicket(ticket);
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: string): void => {
    console.log("Updating ticket status:", ticketId, newStatus);
    toast({
      title: "Status Updated",
      description: `Ticket ${ticketId} status changed to ${newStatus}`,
    });
  };

  const handleDeleteTicket = (ticketId: string): void => {
    console.log("Deleting ticket:", ticketId);
    toast({
      title: "Ticket Deleted",
      description: `Ticket ${ticketId} has been deleted`,
      variant: "destructive"
    });
  };

  const handleSystemAlert = (): void => {
    console.log("Creating system alert");
    toast({
      title: "System Alert",
      description: "System alert broadcast to all users",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Panel</h1>
          <p className="text-gray-600 mt-2">Manage user support and assistance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={clearAllFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleLiveChat}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supportStats.map((stat: SupportStat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change} from yesterday</p>
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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Support Dashboard</CardTitle>
              <CardDescription>Manage tickets and live support</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tickets" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tickets" className="flex items-center space-x-2">
                    <Ticket className="w-4 h-4" />
                    <span>Tickets</span>
                  </TabsTrigger>
                  <TabsTrigger value="live-chat" className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Live Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input 
                          placeholder="Search tickets by ID, user, or subject..." 
                          className="pl-10" 
                          value={searchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
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
                        <SelectTrigger className="w-[140px]">
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
                        <SelectTrigger className="w-[140px]">
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

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Showing {filteredTickets.length} of {supportTickets.length} tickets
                      </p>
                      {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || userTypeFilter !== "all") && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </div>

                  <Table>
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
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center">
                              <Search className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-gray-500">No tickets found matching your criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket: SupportTicket) => (
                          <TableRow key={ticket.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{ticket.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.user}</p>
                                <p className="text-sm text-gray-500">{ticket.userType}</p>
                              </div>
                            </TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>{ticket.lastUpdate}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Select onValueChange={(value: string) => handleUpdateTicketStatus(ticket.id, value)}>
                                  <SelectTrigger className="w-20 h-8">
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

                <TabsContent value="live-chat" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input 
                          placeholder="Search chats by user, issue, or type..." 
                          className="pl-10" 
                          value={chatSearchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={chatStatusFilter} onValueChange={setChatStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Chat Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
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

                  <div className="space-y-3">
                    <h3 className="font-semibold">Active Chats</h3>
                    {filteredChats.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">No active chats found matching your criteria</p>
                        </div>
                      </div>
                    ) : (
                      filteredChats.map((chat: LiveChat) => (
                        <div key={chat.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="font-medium">{chat.user}</p>
                                <p className="text-sm text-gray-500">{chat.userType} • {chat.issue}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getChatStatusBadge(chat.status)}
                              <span className="text-sm text-gray-500">{chat.duration}</span>
                              <Button size="sm" onClick={() => handleJoinChat(chat.id)}>Join</Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div className="p-6 text-center">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                    <p className="text-gray-600 mb-4">Send support emails directly to users</p>
                    <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Send className="w-4 h-4 mr-2" />
                          Compose Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Compose Email</DialogTitle>
                          <DialogDescription>Send an email to users or support team</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email-to">To</Label>
                            <Input
                              id="email-to"
                              placeholder="user@example.com"
                              value={emailData.to}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailData({...emailData, to: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email-subject">Subject</Label>
                            <Input
                              id="email-subject"
                              placeholder="Email subject"
                              value={emailData.subject}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailData({...emailData, subject: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email-message">Message</Label>
                            <Textarea
                              id="email-message"
                              placeholder="Type your message here"
                              value={emailData.message}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailData({...emailData, message: e.target.value})}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Ticket className="w-4 h-4 mr-2" />
                    Create New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>Create a support ticket for a user</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="user-email">User Email</Label>
                      <Input
                        id="user-email"
                        placeholder="user@example.com"
                        value={newTicket.userEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTicket({...newTicket, userEmail: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ticket-subject">Subject</Label>
                      <Input
                        id="ticket-subject"
                        placeholder="Ticket subject"
                        value={newTicket.subject}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTicket({...newTicket, subject: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ticket-priority">Priority</Label>
                      <Select value={newTicket.priority} onValueChange={(value: string) => setNewTicket({...newTicket, priority: value})}>
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
                    <div>
                      <Label htmlFor="ticket-description">Description</Label>
                      <Textarea
                        id="ticket-description"
                        placeholder="Describe the issue"
                        value={newTicket.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTicket({...newTicket, description: e.target.value})}
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
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Live Chat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Live Chat Dashboard</DialogTitle>
                    <DialogDescription>Monitor and join active chat sessions</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Active chat sessions: {liveChats.length}</p>
                    {liveChats.map((chat: LiveChat) => (
                      <div key={chat.id} className="p-3 border rounded bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{chat.user}</p>
                            <p className="text-xs text-gray-500">{chat.issue}</p>
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

              <Button variant="outline" className="w-full justify-start" onClick={() => setIsEmailDialogOpen(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Email
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleSystemAlert}>
                <AlertCircle className="w-4 h-4 mr-2" />
                System Alert
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Popular Articles</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-blue-600 hover:underline cursor-pointer" onClick={() => toast({title: "Article", description: "Opening: How to reset password"})}>How to reset password</li>
                  <li className="text-blue-600 hover:underline cursor-pointer" onClick={() => toast({title: "Article", description: "Opening: Upload resume guide"})}>Upload resume guide</li>
                  <li className="text-blue-600 hover:underline cursor-pointer" onClick={() => toast({title: "Article", description: "Opening: Company verification process"})}>Company verification process</li>
                  <li className="text-blue-600 hover:underline cursor-pointer" onClick={() => toast({title: "Article", description: "Opening: Student profile setup"})}>Student profile setup</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Resolution Rate</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Satisfaction Score</span>
                <span className="text-sm font-medium">4.8/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">First Response</span>
                <span className="text-sm font-medium">&lt; 1 hour</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ticket Details - {selectedTicket?.id}</DialogTitle>
            <DialogDescription>View and manage ticket information</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="text-sm">{selectedTicket.user}</p>
                </div>
                <div>
                  <Label>User Type</Label>
                  <p className="text-sm">{selectedTicket.userType}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{selectedTicket.created}</p>
                </div>
                <div>
                  <Label>Last Update</Label>
                  <p className="text-sm">{selectedTicket.lastUpdate}</p>
                </div>
              </div>
              <div>
                <Label>Subject</Label>
                <p className="text-sm mt-1">{selectedTicket.subject}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedTicket.description}</p>
              </div>
              <div>
                <Label>Assigned To</Label>
                <p className="text-sm mt-1">{selectedTicket.assignedTo}</p>
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