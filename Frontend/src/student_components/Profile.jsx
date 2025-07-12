import React, { useState,useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Target, ShieldAlert, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarContext } from './Sidebar';
// Remove Loader import
// import Loader from '../components/Loader';
import KycDialog from './KycDialog';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Move ArraySection outside the main component
const ArraySection = memo(({ label, field, fields, emptyObj, profileData, isEditing, handleArrayItemChange, handleRemoveArrayItem, handleAddArrayItem, renderSubArray }) => {


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{label}</h3>
      {isEditing ? (
        <>
          {(profileData[field] || []).map((item, idx) => (
            <div key={`${field}-${idx}`} className="mb-4 p-3 bg-gray-50 rounded border relative">
              {fields.map(({ key, label, type }) => (
                <div key={key} className="mb-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type={type || "text"}
                    value={Array.isArray(item[key]) ? item[key].join(', ') : (item[key] || '')}
                    onChange={e =>
                      handleArrayItemChange(
                        field, idx, key,
                        type === "number"
                          ? Number(e.target.value)
                          : key === "technologies"
                            ? e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            : e.target.value
                      )
                    }
                    placeholder={label}
                  />
                </div>
              ))}
              <button
                type="button"
                className="absolute top-2 right-2 text-red-500 text-xs px-2 py-1 rounded hover:bg-red-100"
                onClick={() => handleRemoveArrayItem(field, idx)}
              >Remove</button>
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-200 px-3 py-1 rounded"
            onClick={() => handleAddArrayItem(field, { ...emptyObj })}
          >+ Add {label.split(' ')[0]}</button>
        </>
      ) : (
        renderSubArray(profileData[field], fields.map(f => f.key))
      )}
    </div>
  );
});

// All useMemo hooks must be at the top level, before the Profile component function
const PROJECT_FIELDS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "technologies", label: "Technologies (comma separated)" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "link", label: "Link" }
];
const ACHIEVEMENT_FIELDS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "date", label: "Date", type: "date" },
  { key: "issuer", label: "Issuer" }
];
const CERTIFICATION_FIELDS = [
  { key: "name", label: "Name" },
  { key: "issuer", label: "Issuer" },
  { key: "date", label: "Date", type: "date" },
  { key: "link", label: "Link" }
];
const EXTRACURRICULAR_FIELDS = [
  { key: "activity", label: "Activity" },
  { key: "role", label: "Role" },
  { key: "achievement", label: "Achievement" }
];
const RESEARCH_FIELDS = [
  { key: "title", label: "Title" },
  { key: "role", label: "Role" },
  { key: "year", label: "Year", type: "number" },
  { key: "description", label: "Description" }
];
const HACKATHON_FIELDS = [
  { key: "name", label: "Name" },
  { key: "year", label: "Year", type: "number" },
  { key: "achievement", label: "Achievement" },
  { key: "description", label: "Description" }
];

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  });
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [kycStatus, setKycStatus] = useState('not started'); // New state for KYC status
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [kycStep, setKycStep] = useState(0); // 0: intro, 1: payment, 2: confirm, 3: done
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [kycIdentifierType, setKycIdentifierType] = useState('phone');
  const [kycIdentifierValue, setKycIdentifierValue] = useState('');
  const [isKycPaymentDialogOpen, setIsKycPaymentDialogOpen] = useState(false);
  const [kycPaymentMessage, setKycPaymentMessage] = useState({ text: '', type: '' });
  const [kycPaymentLoading, setKycPaymentLoading] = useState(false);
  const [kycProcessing, setKycProcessing] = useState(false);
  const [kycButtonLoading, setKycButtonLoading] = useState(false);
  const [paymentRedirected, setPaymentRedirected] = useState(() => {
    // Check localStorage for existing payment redirect state
    return localStorage.getItem('paymentRedirected') === 'true';
  });
  
  // Countdown and WebSocket states
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const paymentTimeoutRef = useRef(null); // New ref for payment timeout

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      window.location.href = '/student-login';
    }
  }, [token]);

  // Clear payment redirected state if payment is already completed
  useEffect(() => {
    if (profileData?.payment?.status === 'paid' && paymentRedirected) {
      setPaymentRedirected(false);
      localStorage.removeItem('paymentRedirected');
    }
  }, [profileData?.payment?.status, paymentRedirected]);

  // Payment timeout effect - reset after 1 minute if no response
  useEffect(() => {
    if (paymentRedirected) {
      // Clear any existing timeout
      if (paymentTimeoutRef.current) {
        clearTimeout(paymentTimeoutRef.current);
      }
      
      // Set new timeout for 1 minute (60000ms)
      paymentTimeoutRef.current = setTimeout(() => {
        console.log('Payment timeout reached - resetting payment state');
        setPaymentRedirected(false);
        localStorage.removeItem('paymentRedirected');
        toast.info('Payment timeout. Please try again if payment was not completed.');
      }, 60000); // 1 minute timeout
      
      // Cleanup timeout on unmount or when paymentRedirected changes
      return () => {
        if (paymentTimeoutRef.current) {
          clearTimeout(paymentTimeoutRef.current);
        }
      };
    }
  }, [paymentRedirected]);

  // Handle URL parameters and payment success
  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);

      // Check payment status and set KYC step
      if (profileData?.payment?.status === 'paid') {
        setKycStep(2); // Go directly to KYC initiation step if payment is paid
        console.log('Payment already paid, opening KYC dialog at step 2');
      } else {
        setKycStep(0); // Start from intro step if payment is not paid
      }

      // Remove query parameters from URL (hide from user)
      window.history.replaceState({}, document.title, window.location.pathname);

      // If payment was successful, re-fetch data (keep your existing logic if needed)
      if (params.get('payment') === 'success') {
        const fetchProfileData = async () => {
          try {
            setError(null);
            const response = await fetch(`${API_URL}/api/student/me`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            if (response.status === 401 || response.status === 403) {
              window.location.href = '/student-login';
              return;
            }
            if (!response.ok) {
              throw new Error('Failed to fetch profile data');
            }
            const data = await response.json();
            const profileInfo = data.profile || data;
            setProfileData(profileInfo);
            
            // Use setTimeout without blocking the main function

              if (profileInfo.payment?.status === 'paid') {
                setKycStep(2); // Set to KYC initiation step if payment is already paid
                console.log('Payment already paid, setting KYC step to 2');
              } else {
                console.log(profileInfo.payment?.status);
              }
              window.history.replaceState({}, document.title, location.pathname);

          } catch (err) {
            setError(err.message || 'Unknown error');
          }
        };
        fetchProfileData();
      }
    }
  }, [location.search, token, profileData]);

  // fetch kyc status from the backend
  useEffect(() => {
    const fetchKycStatus = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/kyc/status`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('KYC Status:', data.kycStatus);
          console.log('verification id:', data.kycData?.verificationId);
          
          // If iskycVerified is true, set to approved
          if (data.kycStatus === 'verified' || data.iskycVerified|| data.kycStatus === 'approved') {
            setKycStatus('approved');
          }
          if (data.kycStatus === 'pending' || data.kycStatus === 'pending approval'|| data.kycStatus === 'requested') {
            // setKycStatus('pending');
          }
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error);
      }
    };
    
    // Only fetch KYC status if we have a token and haven't already fetched it
    if (token && kycStatus === 'not started') {
      fetchKycStatus();
    }
  }, [token, kycStatus]);

  // Separate useEffect to handle payment status check after profileData is loaded
  useEffect(() => {
    if (profileData && profileData.payment?.status === 'paid' && kycStep !== 3) {
      setKycStep(2); // Set to KYC initiation step if payment is already paid and not at step 3
      console.log('Payment already paid, setting KYC step to 2');
    } else if (profileData) {
      console.log('Payment status:', profileData.payment?.status);
    }
    }, [profileData, kycStep]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setError(null);
        const response = await fetch(`${API_URL}/api/student/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/student-login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();

        const profileInfo = data.profile || data;
        setProfileData(profileInfo);
        
        // Check payment status from profile data and set KYC step accordingly
      } catch (err) {
        setError(err.message || 'Unknown error');
      }
    };
    fetchProfileData();
  }, [token]);

  // Set default KYC identifier value when profile data is loaded and check payment status
  useEffect(() => {
    if (profileData?.phone) {
      setKycIdentifierValue(profileData.phone);
    }
    
    // Check payment status and update KYC step accordingly
    if (profileData?.payment?.status === 'paid' && kycStep !== 3) {
      setKycStep(2); // Set to KYC initiation step if payment is paid and not at step 3
      console.log('Payment status changed to paid, setting KYC step to 2');
    }
  }, [profileData,token, kycStep]);

  // WebSocket connection setup
  useEffect(() => {
    if (token && profileData?._id) {
      try {
        // Connect to WebSocket server with development-friendly configuration
        const backendUrl = 'http://localhost:5000'; // Use explicit backend URL for localhost
        socketRef.current = io(backendUrl, {
          auth: {
            token: token
          },
          transports: ['polling', 'websocket'], // Try polling first, then websocket
          timeout: 20000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          maxReconnectionAttempts: 5
        });

        // Join student's room for real-time updates
        socketRef.current.emit('join', profileData._id);

        // Listen for payment status updates
        socketRef.current.on('payment-status', (data) => {
          console.log('Payment status update received:', data);
          
          if (data.status === 'success') {
            // Clear payment timeout since payment was successful
            if (paymentTimeoutRef.current) {
              clearTimeout(paymentTimeoutRef.current);
              paymentTimeoutRef.current = null;
            }
            
            // Update profile data with payment success
            setProfileData(prev => ({
              ...prev,
              payment: {
                status: 'paid',
                amount: data.amount,
                currency: data.currency,
                date: new Date()
              }
            }));
            
            // Reset payment redirected state
            setPaymentRedirected(false);
            localStorage.removeItem('paymentRedirected');
            
            // Show success toast
            toast.success('Payment successful! You can now proceed with KYC verification.');
            
            // Set KYC step to 2 (KYC initiation) only if not at step 3
            if (kycStep !== 3) {
              setKycStep(2);
            }
            
          } else if (data.status === 'failed') {
            // Clear payment timeout since payment failed
            if (paymentTimeoutRef.current) {
              clearTimeout(paymentTimeoutRef.current);
              paymentTimeoutRef.current = null;
            }
            
            // Reset payment redirected state on failure
            setPaymentRedirected(false);
            localStorage.removeItem('paymentRedirected');
            
            // Show failure toast
            toast.error(`Payment failed: ${data.message || 'Unknown error'}`);
          }
        });

        // Listen for connection events
        socketRef.current.on('connect', () => {
          console.log('WebSocket connected successfully');
          setIsWebSocketConnected(true);
        });

        socketRef.current.on('connect_error', (error) => {
          console.log('WebSocket connection error:', error.message);
          setIsWebSocketConnected(false);
          // Don't show error to user, just log it
        });

        socketRef.current.on('reconnect', (attemptNumber) => {
          console.log('WebSocket reconnected after', attemptNumber, 'attempts');
          setIsWebSocketConnected(true);
        });

        socketRef.current.on('reconnect_error', (error) => {
          console.log('WebSocket reconnection error:', error.message);
          setIsWebSocketConnected(false);
        });

        socketRef.current.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          setIsWebSocketConnected(false);
          if (reason === 'io server disconnect') {
            // the disconnection was initiated by the server, reconnect manually
            socketRef.current.connect();
          }
        });

        // Cleanup on unmount
        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          // Clear payment timeout on unmount
          if (paymentTimeoutRef.current) {
            clearTimeout(paymentTimeoutRef.current);
          }
        };
      } catch (error) {
        console.log('WebSocket setup error:', error.message);
        // Continue without WebSocket - the app will still work
      }
    }
  }, [token, profileData?._id]);

  // Fallback polling for payment status when WebSocket is not available
  useEffect(() => {
    if (profileData?._id && !isWebSocketConnected) {
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`${API_URL}/api/student/me`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            const profileInfo = data.profile || data;
            
            // Check if payment status changed
            if (profileInfo.payment?.status === 'paid' && profileData.payment?.status !== 'paid') {
              // Clear payment timeout since payment was successful
              if (paymentTimeoutRef.current) {
                clearTimeout(paymentTimeoutRef.current);
                paymentTimeoutRef.current = null;
              }
              
              setProfileData(profileInfo);
              setPaymentRedirected(false);
              localStorage.removeItem('paymentRedirected');
              toast.success('Payment successful! You can now proceed with KYC verification.');
              if (kycStep !== 3) {
                setKycStep(2);
              }
            }
          }
        } catch (err) {
          console.log('Payment status check error:', err.message);
        }
      };

      // Check immediately
      checkPaymentStatus();
      
      // Then check every 10 seconds
      pollingRef.current = setInterval(checkPaymentStatus, 10000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [profileData?._id, isWebSocketConnected, token, profileData?.payment?.status]);


  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl('');
    setProfilePicFile(null);
  };

  const handleInputChange = useCallback((field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddArrayItem = useCallback((field, emptyObj) => {
    handleInputChange(field, [...(profileData[field] || []), emptyObj]);
  }, [handleInputChange, profileData]);

  const handleRemoveArrayItem = useCallback((field, idx) => {
    const arr = [...(profileData[field] || [])];
    arr.splice(idx, 1);
    handleInputChange(field, arr);
  }, [handleInputChange, profileData]);

  const handleArrayItemChange = useCallback((field, idx, key, value) => {
    const arr = [...(profileData[field] || [])];
    arr[idx] = { ...arr[idx], [key]: value };
    handleInputChange(field, arr);
  }, [handleInputChange, profileData]);

  const handleSave = async () => {
    try {
      // Update main profile
      const response = await fetch(`${API_URL}/api/student/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/student-login';
        return;
      }
      if (!response.ok) throw new Error('Failed to update profile');
      let data = await response.json();

      // Upload profile pic if selected
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);
        const picRes = await fetch(`${API_URL}/api/student/me/profile-pic`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (picRes.ok) {
          data = await picRes.json();
        }
      }

      setProfileData(data.profile || data);
      setIsEditing(false);
      setPreviewUrl('');
      setProfilePicFile(null);
    } catch {
      alert('Failed to update profile');
    }
  };

  const handleVerification = async () => {
    // Prevent multiple clicks
    if (kycButtonLoading) return;
    
    setKycButtonLoading(true);

    try {
      if (kycStatus === 'verified' || kycStatus === 'approved') {
        toast.success('KYC is already verified.');
        return;
      }
      
      // Check payment status and set KYC step accordingly (no API call needed)
      if (profileData?.payment?.status === 'paid') {
        setKycStep(2); // Go directly to KYC initiation step if payment is paid
        console.log('Payment already paid, setting KYC step to 2');
      } else {
        setKycStep(0); // Start from intro step if payment is not paid
      }
      
      setIsKycDialogOpen(true);
    } catch (error) {
      console.error('KYC verification error:', error);
      toast.error('Failed to initiate KYC verification');
    } finally {
      setKycButtonLoading(false);
    }
  };

  const handleKycNext = () => {
    if (kycStep === 0 && profileData.payment?.status === 'paid') {
      // If payment is already paid, skip to step 2 (KYC initiation)
      setKycStep(2);
    } else if (kycStep === 2) {
      // Set default value for identifier when moving to step 2
      setKycIdentifierValue(kycIdentifierType === 'phone' ? (profileData.phone || '') : (profileData.email || ''));
      setKycStep(3); // Move to completion step
    } else {
      // Normal step increment
      setKycStep((prev) => prev + 1);
    }
  };

  const handleKycBack = () => {
    setKycStep((prev) => prev - 1);
  };

  const handleKycClose = () => {
    setIsKycDialogOpen(false);
    // Reset to appropriate step based on payment status, but preserve step 3
    if (kycStep === 3) {
      // If we're at step 3, keep it there so user can see the message
      // The step will be reset when dialog is opened again
    } else if (profileData?.payment?.status === 'paid') {
      setKycStep(2); // Keep at KYC initiation step if payment is paid
    } else {
      setKycStep(0); // Reset to intro step if payment is not paid
    }
    setPaymentProcessing(false);
  };

  const handlePayment = async () => {
    if (kycStatus === 'approved' || kycStatus === 'verified') {
      alert('KYC is already approved or verified.');
      return;
    }
    if (paymentProcessing) return; // Prevent multiple clicks
    setPaymentProcessing(true);

    try {
      // Use profileData for userId and email
      const userId = profileData?._id || profileData?.id;
      const customerEmail = profileData?.email;

      if (!userId || !customerEmail) {
        alert('User information not available for payment.');
        setPaymentProcessing(false);
        return;
      }

      const response = await fetch('https://campuspg.onrender.com/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          customerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      let data = null;
      try { data = await response.json(); } catch {}

              if (data && data.success && data.redirectUrl) {
        // Set payment redirected state in localStorage before redirecting
        setPaymentRedirected(true);
        localStorage.setItem('paymentRedirected', 'true');
        
        // Redirect to Payomatix payment gateway in the current tab
        window.location.href = data.redirectUrl;

        // Optionally, move to next KYC step or wait for webhook confirmation
        setKycStep(2); // Move to confirm step
      } else {
        alert('Payment initiation failed: ' + (data?.message || 'No redirect URL received.'));
      }
    } catch (error) {
      alert('Payment initiation failed: ' + error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleKycConfirm = async () => {
    console.log('🔍 handleKycConfirm called');
    console.log('🔍 API_URL:', API_URL);
    console.log('🔍 token:', token ? 'exists' : 'missing');
    console.log('🔍 profileData:', profileData);
    console.log('🔍 kycIdentifierType:', kycIdentifierType);
    console.log('🔍 kycIdentifierValue:', kycIdentifierValue);
    
    // Set loading state
    setKycProcessing(true);
    
    // First, check if KYC is already in progress
    try {
      const statusResponse = await fetch(`${API_URL}/api/kyc/status`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('🔍 Current KYC status:', statusData);
        
        // If KYC is already in progress or completed, show appropriate message
        if (statusData.kycData?.verificationId) {
          if (statusData.kycStatus === 'pending' || statusData.kycStatus === 'pending approval') {
            toast.info('KYC verification is already in progress. Please check your SMS/Email for the verification link.');
            setKycStep(3); // Show step 3 with existing verification
            setKycProcessing(false); // Reset loading state
            return;
          } else if (statusData.kycStatus === 'verified' || statusData.kycStatus === 'approved') {
            toast.success('KYC verification is already completed!');
            setKycStatus('approved');
            setIsKycDialogOpen(false);
            setKycProcessing(false); // Reset loading state
            return;
          }
        }
      }
    } catch (error) {
      console.log('🔍 Error checking KYC status:', error);
      // Continue with KYC initiation if status check fails
    }
    
    try {
      const identifier = kycIdentifierType === 'phone' ? { phone: kycIdentifierValue } : { email: kycIdentifierValue };
      console.log('🔍 identifier:', identifier);
      
      const requestBody = {
        ...identifier,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        template_name: 'ADHAAR_PAN_MARKSHEET',
      };
      console.log('🔍 requestBody:', requestBody);
      
      console.log('🔍 Making API call to:', `${API_URL}/api/kyc/verify-digio`);
      
      const response = await fetch(`${API_URL}/api/kyc/verify-digio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      if(response.status === 400) {
        console.log('🔍 400 error - KYC already in progress');
        const errorData = await response.json();
        toast.info(errorData.message || 'KYC verification already in progress or completed. Please check your KYC status.');
        setKycStep(3); // Show step 3 instead of closing
        setKycProcessing(false); // Reset loading state
        return;
      }
      
      if(response.status === 403) {
        console.log('🔍 403 error - Payment required');
        const errorData = await response.json();
        toast.error(errorData.message || 'Payment required before KYC verification');
        setKycStep(1);
        setKycProcessing(false); // Reset loading state
        return;
      }
      
      if (response.status === 401 || response.status === 403) {
        console.log('🔍 Auth error - redirecting to login');
        window.location.href = '/student-login';
        setKycProcessing(false); // Reset loading state
        return;
      }
      
      if (!response.ok) {
        console.log('🔍 Response not ok');
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate KYC verification');
      }
      
      const data = await response.json();
      console.log('🔍 Success response:', data);
      
      // Success - show step 3 and keep dialog open
      setKycStep(3);
      toast.success('KYC verification initiated! Please check your SMS/Email for the verification link.');
      setKycProcessing(false); // Reset loading state
      
      // Don't auto-close the dialog - let user close it manually
      // setTimeout(() => {
      //   setIsKycDialogOpen(false);
      // }, 3000);
      
    } catch (error) {
      console.error('❌ KYC verification error:', error);
      toast.error(error.message || 'Failed to initiate KYC verification');
      setKycProcessing(false); // Reset loading state
      // Don't close dialog on error - let user see the error
      // setIsKycDialogOpen(false);
    }
  };

  // Function to open KYC payment dialog
  const openKycPaymentDialog = () => {
    setKycPaymentMessage({ text: '', type: '' });
    setIsKycPaymentDialogOpen(true);
  };

  // Function to close and reset KYC payment dialog
  const closeKycPaymentDialog = () => {
    setIsKycPaymentDialogOpen(false);
    setKycPaymentMessage({ text: '', type: '' });
    setKycPaymentLoading(false);
  };

  // KYC Payment submit handler
  const handleKycPaymentSubmit = async (event) => {
    event.preventDefault();
    setKycPaymentMessage({ text: '', type: '' });
    if (!profileData?._id || !profileData?.email) {
      setKycPaymentMessage({ text: 'User ID and Email are required.', type: 'error' });
      return;
    }
    setKycPaymentLoading(true);
    setKycPaymentMessage({ text: 'Initiating payment... Please wait.', type: 'info' });
    try {
      const response = await fetch('https://campuspg.onrender.com/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profileData._id, customerEmail: profileData.email }),
      });
      let data = null;
      try { data = await response.json(); } catch {}
      if (response.ok && data && data.success && data.redirectUrl) {
        setKycPaymentMessage({ text: 'Redirecting to payment gateway...', type: 'success' });
        setPaymentRedirected(true);
        localStorage.setItem('paymentRedirected', 'true');
        window.location.href = data.redirectUrl;
      } else if (response.ok) {
        setKycPaymentMessage({ text: 'Payment initiated. Please complete the payment.', type: 'success' });
      } else {
        setKycPaymentMessage({ text: data?.message || 'Failed to initiate payment. Please try again.', type: 'error' });
      }
    } catch (error) {
      setKycPaymentMessage({ text: 'Network error: Could not connect to backend. Please try again.', type: 'error' });
    } finally {
      setKycPaymentLoading(false);
    }
  };



  if (!profileData) {
    return <div className="p-10 text-center text-gray-500">No profile data found.</div>;
  }

  const getProfilePicUrl = () => {
    if (previewUrl) return previewUrl;
    if (profileData)
      return `${API_URL}/api/student/me/profile-pic?${Date.now()}`;
    if (profileData && profileData.profileImage) return profileData.profileImage;
    return '';
  };

  // Helper to render array values nicely
  const renderArray = arr => Array.isArray(arr) ? arr.join(', ') : '';

  // Helper for sub-array rendering (projects, etc.)
  const renderSubArray = (arr, fields) =>
    Array.isArray(arr) && arr.length
      ? arr.map((item, idx) => (
          <div key={idx} className="mb-3 border-b border-gray-100 pb-2 last:pb-0 last:border-b-0">
            {fields.map(f => item[f] && (
              <div key={f}><span className="font-medium">{f}:</span> {Array.isArray(item[f]) ? item[f].join(', ') : item[f]}</div>
            ))}
          </div>
        ))
      : <span className="italic text-gray-400">None</span>;

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
    <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold">Rojgar Setu</span>
        </div>
          {/* Sticky Top Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <User className="text-gray-600" size={20} />
                <h1 className="text-lg font-medium text-gray-900">Complete Profile</h1>
              </div>
              <div className="flex space-x-2 items-center">
                {/* KYC Button at the top */}
                <button
                  onClick={handleVerification}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border transition-colors text-base shadow mr-2 ${
                    kycButtonLoading ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                      : kycStatus === 'pending' ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                      : kycStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                      : kycStatus === 'verified' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                      : paymentRedirected ? 'bg-orange-100 text-orange-800 border-orange-200 cursor-not-allowed'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                  }`}
                  style={{ outline: 'none' }}
                  disabled={kycButtonLoading || kycStatus === 'approved' || kycStatus === 'verified' || kycStatus === 'pending' || paymentRedirected}
                >
                  {kycButtonLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      {kycStatus === 'pending' ? <ShieldAlert className="w-5 h-5" /> : "👍"}
                      {kycStatus === 'approved' ? 'KYC Done' : 
                       kycStatus === 'verified' ? 'KYC Verified' : 
                       kycStatus === 'pending' ? 'Pending' : 
                       kycStatus === 'pending approval' ? 'Pending Approval' : 
                       paymentRedirected ? 'Wait' :
                       profileData?.payment?.status === 'paid' ? 'Continue KYC' : 
                       'Complete Your Verification'}
                    </>
                  )}
                </button>


                {/* Edit/Save/Cancel buttons */}
                {isEditing ? (
                  <>
                    <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Edit Profile</button>
                )}
              </div>
            </div>
          </div>
          <div className="relative flex-1 bg-gray-50 min-h-full">
            {error && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <p className="text-red-600 font-medium text-lg">Error: {error}</p>
              </div>
            )}
            {!error && !profileData && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <p className="text-gray-600 font-medium text-lg">No profile data found.</p>
              </div>
            )}
            {!error && profileData && (
          <div className="p-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                  {isEditing ? (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      {previewUrl || (profileData && (profileData._id || profileData.profileImage)) ? (
                        <img
                          src={getProfilePicUrl()}
                          alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white font-bold text-3xl">
                          {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : ''}
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfilePicFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <span className="text-xs mt-1 bg-white bg-opacity-60 rounded px-2 py-1 text-blue-700">Change</span>
                    </label>
                  ) : (
                    (profileData && (profileData._id || profileData.profileImage)) ? (
                      <img src={getProfilePicUrl()} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : ''}
                      </span>
                    )
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input type="text" value={profileData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your name" />
                      <input type="text" value={profileData.headline || ''} onChange={(e) => handleInputChange('headline', e.target.value)} className="text-lg text-gray-600 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your profile headline" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h2>
                      <p className="text-lg text-gray-600 mb-4">{profileData.headline}</p>
                    </>
                  )}

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-4">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} />
                      {isEditing ? (
                        <input type="email" value={profileData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter email" />
                      ) : (
                        <span>{profileData.email}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} />
                      {isEditing ? (
                        <input type="tel" value={profileData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter phone" />
                      ) : (
                        <span>{profileData.phone}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      {isEditing ? (
                        <input type="text" value={profileData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter location" />
                      ) : (
                        <span>{profileData.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

                {/* Career Objective */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2 text-red-600" size={20} />
                Career Objective
              </h3>
              {isEditing ? (
                <textarea
                  value={profileData.careerObjective || ''}
                  onChange={(e) => handleInputChange('careerObjective', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Describe your career objectives and goals..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profileData.careerObjective}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Student ID', field: 'studentId', icon: '🆔' },
                    { label: 'Date of Birth', field: 'dateOfBirth', icon: '📅', type: 'date' },
                    { label: 'Gender', field: 'gender', icon: '👤' },
                    { label: 'Nationality', field: 'nationality', icon: '🌍' }
                  ].map(({ label, field, icon, type }) => (
                    <div key={field} className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </label>
                      {isEditing ? (
                        <input
                          type={type || "text"}
                          value={profileData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      ) : (
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">{profileData[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
                  {/* Academic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar className="mr-2 text-green-600" size={20} />
                  Academic Information
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Degree', field: 'degree', icon: '🎓' },
                    { label: 'Major', field: 'major', icon: '📚' },
                    { label: 'Batch', field: 'batch', icon: '🎒' },
                    { label: 'Joining Year', field: 'joiningYear', icon: '🔰', type: 'number' },
                    { label: 'Graduation Year', field: 'graduationYear', icon: '🎓', type: 'number' },
                    { label: 'Year', field: 'year', icon: '📖', type: 'number' },
                    { label: 'GPA', field: 'gpa', icon: '📊', type: 'number' },
                    { label: 'CGPA', field: 'cgpa', icon: '📈', type: 'number' }
                  ].map(({ label, field, icon, type }) => (
                    <div key={field} className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </label>
                      {isEditing ? (
                        <input
                          type={type || (typeof profileData[field] === "number" ? "number" : "text")}
                          value={profileData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      ) : (
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                          {profileData[field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Skills & Tech */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills & Technologies</h3>
                <div className="space-y-2">
                  {['skills', 'programmingLanguages', 'technologies'].map(field =>
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={Array.isArray(profileData[field]) ? profileData[field].join(', ') : (profileData[field] || '')}
                          onChange={e => {
                            const value = e.target.value;
                            // Store as string while typing for better UX
                            handleInputChange(field, value);
                          }}
                          onBlur={e => {
                            // When losing focus, convert to array and clean up
                            const value = e.target.value;
                            const items = value.split(',')
                              .map(item => item.trim())
                              .filter(item => item.length > 0);
                            handleInputChange(field, items);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                          placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} (comma separated)`}
                        />
                      ) : (
                        <p className="bg-gray-50 p-3 rounded">{renderArray(profileData[field])}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

                  {/* Resume & Portfolio */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Resume & Portfolio</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resume (link)</label>
                    {isEditing ? (
                      <input type="text" value={profileData.resume || ''} onChange={e => handleInputChange('resume', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://your-resume-link" />
                    ) : (
                      profileData.resume
                        ? <a className="text-blue-600 underline" href={profileData.resume} target="_blank" rel="noopener noreferrer">{profileData.resume}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                    {isEditing ? (
                      <input type="text" value={profileData.portfolioUrl || ''} onChange={e => handleInputChange('portfolioUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://your-portfolio-link" />
                    ) : (
                      profileData.portfolioUrl
                        ? <a className="text-blue-600 underline" href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer">{profileData.portfolioUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    {isEditing ? (
                      <input type="text" value={profileData.githubUrl || ''} onChange={e => handleInputChange('githubUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://github.com/your-profile" />
                    ) : (
                      profileData.githubUrl
                        ? <a className="text-blue-600 underline" href={profileData.githubUrl} target="_blank" rel="noopener noreferrer">{profileData.githubUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    {isEditing ? (
                      <input type="text" value={profileData.linkedinUrl || ''} onChange={e => handleInputChange('linkedinUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://linkedin.com/in/your-profile" />
                    ) : (
                      profileData.linkedinUrl
                        ? <a className="text-blue-600 underline" href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer">{profileData.linkedinUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

                {/* Projects, Achievements, Certifications, Extracurricular, Research, Hackathons */}
            <ArraySection
              label="Projects"
              field="projects"
              fields={PROJECT_FIELDS}
              emptyObj={{ title: "", description: "", technologies: [], startDate: "", endDate: "", link: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Achievements"
              field="achievements"
              fields={ACHIEVEMENT_FIELDS}
              emptyObj={{ title: "", description: "", date: "", issuer: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Certifications"
              field="certifications"
              fields={CERTIFICATION_FIELDS}
              emptyObj={{ name: "", issuer: "", date: "", link: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Extracurricular Activities"
              field="extracurricular"
              fields={EXTRACURRICULAR_FIELDS}
              emptyObj={{ activity: "", role: "", achievement: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Research"
              field="research"
              fields={RESEARCH_FIELDS}
              emptyObj={{ title: "", role: "", year: "", description: "" }}
                  profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
            <ArraySection
              label="Hackathons"
              field="hackathons"
              fields={HACKATHON_FIELDS}
              emptyObj={{ name: "", year: "", achievement: "", description: "" }}
               profileData={profileData}
                  isEditing={isEditing}
                  handleArrayItemChange={handleArrayItemChange}
                  handleRemoveArrayItem={handleRemoveArrayItem}
                  handleAddArrayItem={handleAddArrayItem}
                  renderSubArray={renderSubArray}
            />
        
    

      {/* KYC Dialog and Backdrop */}
      <KycDialog
        isKycDialogOpen={isKycDialogOpen}
        kycStep={kycStep}
        setKycStep={setKycStep}
        kycStatus={kycStatus}
        paymentProcessing={paymentProcessing}
        kycProcessing={kycProcessing}
        profileData={profileData}
        kycIdentifierType={kycIdentifierType}
        setKycIdentifierType={setKycIdentifierType}
        kycIdentifierValue={kycIdentifierValue}
        setKycIdentifierValue={setKycIdentifierValue}
        handleKycClose={handleKycClose}
        handleKycNext={handleKycNext}
        handleKycBack={handleKycBack}
        handlePayment={handlePayment}
        handleKycConfirm={handleKycConfirm}
      />
      {/* KYC Payment Dialog Modal */}
      {isKycPaymentDialogOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[99999]"
          onClick={e => { if (e.target === e.currentTarget) closeKycPaymentDialog(); }}
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative animate-fade-in-up mx-4">
            <button
              onClick={closeKycPaymentDialog}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close dialog"
            >
              &times;
            </button>
            <h1 className="text-xl font-bold mb-4 text-gray-800">KYC Payment</h1>
            <p className="text-sm text-gray-600 mb-4">
              Please proceed to pay the KYC verification fee. You will be redirected to the payment gateway.
            </p>
            <form onSubmit={handleKycPaymentSubmit} className="space-y-4">
              <div>
                <label htmlFor="kycCustomerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  id="kycCustomerEmail"
                  name="kycCustomerEmail"
                  value={profileData?.email || ''}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md hover:shadow-lg"
                disabled={kycPaymentLoading}
              >
                {kycPaymentLoading ? 'Processing...' : 'Pay KYC Fee'}
              </button>
            </form>
            {kycPaymentMessage.text && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  kycPaymentMessage.type === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : kycPaymentMessage.type === 'error'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
                role="alert"
              >
                {kycPaymentMessage.text}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
            )}
    </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Profile;
