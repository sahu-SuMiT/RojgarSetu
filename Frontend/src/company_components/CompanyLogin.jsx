import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding } from 'react-icons/fa';
import axios from 'axios';
axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
import './CompanyLogin.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';// Debug log to check API URL

const initialRegisterData = {
  name: '', type: '', industry: '', website: '', location: '',
  contactEmail: '', contactPhone: '',
  adminContact: { name: '', email: '', phone: '', designation: '' },
  companySize: '', foundedYear: '', description: ''
};

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState(initialRegisterData);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerStep, setRegisterStep] = useState(1);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTime, setResendTime] = useState(60);
  const [otpInputs, setOtpInputs] = useState(Array(6).fill(''));
  const otpInputRefs = useRef([]);
  const [otpStatus, setOtpStatus] = useState('idle');
  const [registerType, setRegisterType] = useState('company');

  useEffect(() => {
    let timer;
    if (showRegister && registerStep === 2) {
      setResendDisabled(true);
      setResendTime(60);
      timer = setInterval(() => {
        setResendTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showRegister, registerStep]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/company-admin`, formData, { withCredentials: true });
      const { _id, name, role } = response.data;
      localStorage.setItem('companyId', _id);
      localStorage.setItem('companyName', name);
      localStorage.setItem('userRole', role);
      navigate(`/company/${_id}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setRegisterData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOtpInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = value;
      setOtpInputs(newOtpInputs);

      if (value && index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }

      if (newOtpInputs.every(input => input !== '')) {
        checkOtpVerificationStatus(newOtpInputs.join(''));
      }
    }
  };

  const checkOtpVerificationStatus = async (otp) => {
    setOtpStatus('verifying');
    setRegisterError('');
    setRegisterSuccess('');
    try {
      const res = await axios.post(`${apiUrl}/api/auth/register/check-otp`, {
        email: registerData.contactEmail,
        otp: otp,
        type: 'company'
      });
      if (res.data.valid) {
        setOtpStatus('verified');
      } else {
        setOtpStatus('error');
        setRegisterError(res.data.error || 'Invalid OTP.');
        setOtpInputs(Array(6).fill(''));
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }
    } catch (err) {
      setOtpStatus('error');
      setRegisterError(err.response?.data?.error || 'Error verifying OTP.');
      setOtpInputs(Array(6).fill(''));
      if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendTime(60);
    setRegisterError('');
    setRegisterSuccess('');
    try {
      const res = await axios.post(`${apiUrl}/api/${registerType}/register/initiate`, {
        ...registerData,
        type: registerType
      });
      setRegisterSuccess('New OTP sent to your email.');
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Error resending OTP.');
    }
  };

  const handleRegisterInfoSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setEmailCheckLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/company/register/initiate`, registerData);
      setRegisterSuccess(res.data.message || 'OTP sent to your email.');
      setRegisterStep(2);
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Error initiating registration.');
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);
    try {
      const password = e.target.password.value;
      const confirmPassword = e.target.confirmPassword.value;
      if (password !== confirmPassword) {
        setRegisterError('Passwords do not match.');
        return;
      }
      const res = await axios.post(`${apiUrl}/api/company/register/verify`, {
        email: registerData.contactEmail,
        otp: otpInputs.join(''),
        password,
        confirmPassword,
      });
      setRegisterSuccess('Registration successful! Please login.');
      setTimeout(() => {
        setShowRegister(false);
        setRegisterStep(1);
        setRegisterData(initialRegisterData);
      }, 2000);
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Error completing registration.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input className="form-input" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="admin@company.com" />
          </div>
      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <input className="form-input" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
        </div>
      <div className="company-login-actions">
        <a href="/company/forgot-password" className="company-forgot-password-link">Forgot Password?</a>
              </div>
      {error && <div className="login-error-message">{error}</div>}
      <button type="submit" className="login-submit-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
  );

  const renderRegisterForm = () => (
    <div className={`register-form-anim ${showRegister ? 'show' : ''}`}>
        {registerStep === 1 ? renderStepOne() : renderStepTwo()}
            </div>
  );
  
  const renderStepOne = () => (
    <form onSubmit={handleRegisterInfoSubmit} className="registration-form">
      <h3>Company Details</h3>
      <div className="form-group">
        <input className="form-input" name="name" value={registerData.name} onChange={handleRegisterChange} required placeholder="Company Name" />
      </div>
      <div className="form-group">
        <input className="form-input" name="contactEmail" type="email" value={registerData.contactEmail} onChange={handleRegisterChange} required placeholder="Company Email" />
                    </div>
      <div className="form-group">
        <input className="form-input" name="contactPhone" value={registerData.contactPhone} onChange={handleRegisterChange} required placeholder="Contact Phone" />
                    </div>

      <button type="submit" className="login-submit-button" disabled={emailCheckLoading}>
        {emailCheckLoading ? 'Verifying...' : 'Next'}
                </button>
      <div className="login-links-container">
        <button type="button" className="login-link" onClick={() => setShowRegister(false)}>
                  Back to Login
                </button>
              </div>
            </form>
  );

  const renderStepTwo = () => (
      <form onSubmit={handleRegisterSubmit} className="registration-form">
          <h3>Verify Email & Set Password</h3>
          <p className="login-subtitle">Enter the OTP sent to {registerData.contactEmail}</p>
          <div className="otp-inputs">
              {Array(6).fill('').map((_, index) => (
                <input
                    key={index}
                    ref={el => otpInputRefs.current[index] = el}
                    className="otp-input form-input"
                    type="text"
                    maxLength="1"
                    value={otpInputs[index]}
                    onChange={(e) => handleOtpInputChange(e, index)}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
                            otpInputRefs.current[index - 1].focus();
                        }
                    }}
                    autoComplete="one-time-code"
                />
              ))}
              <div className="otp-status">
                  {otpStatus === 'verifying' && <span>...</span>}
                  {otpStatus === 'verified' && <span style={{color: 'green'}}>✅</span>}
                  {otpStatus === 'error' && <span style={{color: 'red'}}>❌</span>}
              </div>
          </div>
          <div className="resend-otp-container">
            <button type="button" onClick={handleResendOtp} disabled={resendDisabled} className="login-link">
              {resendDisabled ? `Resend OTP (${resendTime}s)` : 'Resend OTP'}
            </button>
          </div>
          
          {registerError && <div className="login-error-message">{registerError}</div>}
          {registerSuccess && <div className="login-error-message" style={{backgroundColor: '#dcfce7', borderColor: '#bbf7d0', color: '#166534'}}>{registerSuccess}</div>}

          <input className="form-input" type="password" name="password" required placeholder="New Password" />
          <input className="form-input" type="password" name="confirmPassword" required placeholder="Confirm New Password" />
          <button type="submit" className="login-submit-button" disabled={registerLoading || otpStatus !== 'verified'}>
              {registerLoading ? 'Registering...' : 'Create Account'}
          </button>
          <button type="button" className="login-submit-button back-button" onClick={() => setRegisterStep(1)}>
              Back
                  </button>
      </form>
  );

  return (
    <div className="login-page-wrapper">
      <div className="login-form-container">
        <div className="login-header">
          <div className="login-icon-container"><FaBuilding /></div>
          <h1 className="login-title">
            {showRegister ? 'Register Your Company' : 'Company Admin Portal'}
          </h1>
          <p className="login-subtitle">
            {showRegister ? 'Join our network of top employers.' : 'Access your company dashboard.'}
          </p>
                </div>

        {!showRegister ? renderLoginForm() : renderRegisterForm()}
        
        <div className="login-links-container">
            {!showRegister && (
                <button onClick={() => setShowRegister(true)} className="login-link">
                    Don't have an account? Register Company
                </button>
            )}
          </div>

        <div className="login-footer-note">
          <p>Need help? Contact our administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin; 