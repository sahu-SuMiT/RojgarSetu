import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, CreditCard, UserCheck, Sparkles } from 'lucide-react';

const KycProtectedRoute = ({ children }) => {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/kyc-status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setKycStatus(data.kycStatus);
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkKycStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (kycStatus === 'verified') {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2e8f0%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 animate-pulse delay-500"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl w-full">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Account Verification Required
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Complete your KYC verification to access premium features and unlock your full potential
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Side - Benefits */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Why Complete KYC?
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Enhanced Security</h3>
                      <p className="text-gray-600 text-sm">Protect your account with verified identity</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Trust Building</h3>
                      <p className="text-gray-600 text-sm">Build credibility with employers and colleges</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Premium Access</h3>
                      <p className="text-gray-600 text-sm">Unlock exclusive features and opportunities</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Process */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  Verification Process
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Complete Payment</p>
                      <p className="text-sm text-gray-600">Secure ₹99 verification fee</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Upload Documents</p>
                      <p className="text-sm text-gray-600">Aadhaar, PAN, and photo</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Get Verified</p>
                      <p className="text-sm text-gray-600">Instant verification process</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center">
            <button
              onClick={() => navigate('/studentProfile')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>Start Verification Now</span>
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Secure • Fast • Reliable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycProtectedRoute;
