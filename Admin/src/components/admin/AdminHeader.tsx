import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Ticket, 
  TrendingUp, 
  Shield,
  Briefcase,
  Search, 
  Bell, 
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function AdminHeader() {
  const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([
      { id: 1, message: "KYC verification completed", time: "2 hours ago", unread: true },
      { id: 2, message: "Document uploaded successfully", time: "1 day ago", unread: true },
      { id: 3, message: "Verification ticket approved", time: "3 days ago", unread: false }
    ]);
  
    const handleLogout = () => {
      // In a real app, you would clear tokens, session data, etc.
      toast.success("Logged out successfully");
      navigate("/support"); // Redirect to support page or login page
    };
  
    const markNotificationAsRead = (notificationId: number) => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, unread: false }
            : notification
        )
      );
    };
    
  const unreadCount = notifications.filter(n => n.unread).length;
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search users, content, or reports..." 
              className="pl-10 pr-4 py-2 w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start p-3 cursor-pointer"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm ${notification.unread ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </span>
                      {notification.unread && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <User className="h-5 w-5 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Alex Johnson</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
    </header>
  );
}