import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Users, 
  Lock,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export function PlatformSettings() {
  const systemHealth = [
    { component: "Database", status: "healthy", uptime: "99.9%" },
    { component: "API Server", status: "healthy", uptime: "99.8%" },
    { component: "Email Service", status: "warning", uptime: "98.5%" },
    { component: "File Storage", status: "healthy", uptime: "99.7%" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure and manage platform settings</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* System Health Overview */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>Real-time platform component status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {systemHealth.map((component) => (
                <div key={component.component} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{component.component}</h4>
                    {getStatusBadge(component.status)}
                  </div>
                  <p className="text-sm text-gray-500">Uptime: {component.uptime}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="users">User Settings</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">General Platform Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input id="platform-name" defaultValue="PlacementPro" />
                      </div>
                      
                      <div>
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input id="support-email" defaultValue="support@placementpro.com" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-gray-500">Enable maintenance mode for platform updates</p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-file-size">Max File Upload Size (MB)</Label>
                        <Input id="max-file-size" type="number" defaultValue="10" />
                      </div>
                      
                      <div>
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Input id="session-timeout" type="number" defaultValue="120" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Public Registration</Label>
                          <p className="text-sm text-gray-500">Allow public user registration</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Security Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Password Complexity</Label>
                        <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Rate Limiting</Label>
                        <p className="text-sm text-gray-500">Limit API requests per user</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input id="max-login-attempts" type="number" defaultValue="5" />
                    </div>
                    
                    <div>
                      <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
                      <Input id="lockout-duration" type="number" defaultValue="30" />
                    </div>
                    
                    <div>
                      <Label htmlFor="jwt-expiry">JWT Token Expiry (hours)</Label>
                      <Input id="jwt-expiry" type="number" defaultValue="24" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send email notifications to users</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Send SMS for critical updates</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Browser push notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Templates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Welcome Email
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Password Reset
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Verification
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">User Management Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-approve Students</Label>
                        <p className="text-sm text-gray-500">Automatically approve student registrations</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-approve Companies</Label>
                        <p className="text-sm text-gray-500">Automatically approve company registrations</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Verification Required</Label>
                        <p className="text-sm text-gray-500">Require profile verification for all users</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="max-resume-size">Max Resume Size (MB)</Label>
                      <Input id="max-resume-size" type="number" defaultValue="5" />
                    </div>
                    
                    <div>
                      <Label htmlFor="profile-completion">Required Profile Completion (%)</Label>
                      <Input id="profile-completion" type="number" defaultValue="80" />
                    </div>
                    
                    <div>
                      <Label htmlFor="inactivity-period">User Inactivity Period (days)</Label>
                      <Input id="inactivity-period" type="number" defaultValue="90" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Third-Party Integrations</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">OAuth Providers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Google OAuth</Label>
                          <p className="text-sm text-gray-500">Enable Google sign-in</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>LinkedIn OAuth</Label>
                          <p className="text-sm text-gray-500">Enable LinkedIn sign-in</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Microsoft OAuth</Label>
                          <p className="text-sm text-gray-500">Enable Microsoft sign-in</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">API Integrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Payment Gateway</Label>
                          <p className="text-sm text-gray-500">Stripe payment processing</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Service</Label>
                          <p className="text-sm text-gray-500">SendGrid email delivery</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics</Label>
                          <p className="text-sm text-gray-500">Google Analytics tracking</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Maintenance & Backup</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Database Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Backup</Label>
                          <p className="text-sm text-gray-500">Daily automated backups</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div>
                        <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                        <Input id="backup-retention" type="number" defaultValue="30" />
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Database className="w-4 h-4 mr-2" />
                        Manual Backup
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Updates</Label>
                          <p className="text-sm text-gray-500">Automatic security updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div>
                        <Label htmlFor="maintenance-window">Maintenance Window</Label>
                        <Input id="maintenance-window" defaultValue="02:00 - 04:00 UTC" />
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}