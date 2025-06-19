import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Users, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyPortal = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Company Portal</h1>
          <p className="text-xl text-gray-600">Find and hire talented students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Candidate Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Browse qualified candidates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <img src="/images/favicon.png" alt="Rojgar Setu Logo" className="w-12 h-12 mx-auto mb-4" />
              <CardTitle>Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Create and manage job openings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Review candidate applications</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>Hiring Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Track recruitment metrics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyPortal;
