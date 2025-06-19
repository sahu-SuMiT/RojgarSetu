
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2, BarChart3, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CollegePortal = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">College Portal</h1>
          <p className="text-xl text-gray-600">Manage your campus placement activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Manage student profiles and progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Building2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Company Relations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Manage partnerships with companies</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Events & Drives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Schedule placement drives</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">View placement statistics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CollegePortal;
