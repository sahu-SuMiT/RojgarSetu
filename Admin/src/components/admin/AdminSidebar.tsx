import {
  Ticket,
  TrendingUp,
  Briefcase,
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Settings,
  School,
  Building2,
  GraduationCap,
  UserCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AdminView } from "./AdminDashboard";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
}

const mainMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    view: "overview" as AdminView,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    view: "analytics" as AdminView,
  },
];

const managementItems = [
  {
    title: "User Management",
    icon: Users,
    view: "users" as AdminView,
  },
  {
    title: "Content Moderation",
    icon: Shield,
    view: "moderation" as AdminView,
  },
  {
    title: "Support Panel",
    icon: Headphones,
    view: "support" as AdminView,
  },
];

const systemItems = [
  {
    title: "Platform Settings",
    icon: Settings,
    view: "settings" as AdminView,
  },
];

export function AdminSidebar({ currentView, setCurrentView }: AdminSidebarProps) {
  return (
    <Sidebar className="flex h-screen border-gray-100 bg-white shadow-md">
      <div className="hidden md:flex w-64 h-full flex-col bg-campus-blue text-white">
      <SidebarHeader className="p-6">
        <div className="p-4 font-bold text-xl">
                  <Link to="/admin_dashboard" className="flex items-center">
                    ROJGAR SETU
                  </Link>
                </div>
      </SidebarHeader>

      <SidebarContent className="flex-grow">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setCurrentView(item.view)}
                    isActive={currentView === item.view}
                    className="hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setCurrentView(item.view)}
                    isActive={currentView === item.view}
                    className="hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setCurrentView(item.view)}
                    isActive={currentView === item.view}
                    className="hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-white-900">Admin User</p>
            <p className="text-xs text-white-500">admin@placementpro.com</p>
          </div>
        </div>
      </SidebarFooter>
      </div>
    </Sidebar>
  );
}