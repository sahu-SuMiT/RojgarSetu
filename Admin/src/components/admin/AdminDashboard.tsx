import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { Analytics } from "@/components/dashboard/Analytics";
import { ContentModeration } from "@/components/dashboard/ContentModeration";
import { SupportPanel } from "@/components/dashboard/SupportPanel";
import { PlatformSettings } from "@/components/dashboard/PlatformSettings";

export type AdminView = 
  | "overview" 
  | "users" 
  | "analytics" 
  | "moderation" 
  | "support" 
  | "settings";

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<AdminView>("overview");

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "analytics":
        return <Analytics />;
      case "moderation":
        return <ContentModeration />;
      case "support":
        return <SupportPanel />;
      case "settings":
        return <PlatformSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AdminSidebar currentView={currentView} setCurrentView={setCurrentView} />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;