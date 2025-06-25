import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const startRedirectCountdown = () => {
    let counter = 3;
    setCountdown(counter);

    const interval = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter === 0) {
        clearInterval(interval);
        navigate('/login_panel');
      }
    }, 1000);
  };

  useEffect(() => {
    axios.get(`${apiUrl}/api/auth/check-college-company-auth`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          setAuthorized(true);
        }
      })
      .catch((err) => {
        // Handle known error status codes
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Unauthorized access');
        } else {
          setError('Access Denied. Login required or server error');
        }

        // Optionally delay redirect or allow user to see the message
        startRedirectCountdown();
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="bg-white/90 shadow-lg rounded-xl p-8 max-w-md w-full mx-4 border border-blue-200 flex flex-col items-center">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <h2 className="text-xl font-bold text-blue-600 mb-2">Checking Authorization...</h2>
        <p className="text-gray-500 text-center">Please wait while we verify your access.</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200">
      <div className="bg-white/90 shadow-lg rounded-xl p-8 max-w-md w-full mx-4 border border-red-200 flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-red-500 mb-4 text-center">{error}</p>
        <p className="text-gray-500 text-sm">Redirecting to login... &nbsp;&nbsp;&nbsp;&nbsp;<i style={{ color: 'gray', fontSize: '1.55rem' }}>{countdown}</i></p>
      </div>
    </div>
  );

  return authorized ? children : null;
};

export default ProtectedRoute;
