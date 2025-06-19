
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Search, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Portal</h1>
          <p className="text-xl text-gray-600">Find your perfect internship or job opportunity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Job Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Browse and apply to opportunities</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Manage your resume and portfolio</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Track your application status</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>Networking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Connect with recruiters</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
