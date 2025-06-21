import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity } from 'react-icons/fa';
import axios from 'axios';
axios.defaults.withCredentials = true;
import './CollegeLogin.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialRegisterData = {
  name: '', code: '', contactEmail: '', contactPhone: '', password: ''
};

const CollegeLogin = () => {
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

  useEffect(() => {
    let timer;
    if (showRegister && registerStep === 2) {
      setResendDisabled(true);
      setResendTime(60);
      setOtpStatus('idle'); // Reset OTP status when entering step 2
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
      const response = await axios.post(`${apiUrl}/api/auth/college-admin`, formData);
      const { _id, name, role } = response.data;
      localStorage.setItem('collegeId', _id);
      localStorage.setItem('collegeName', name);
      localStorage.setItem('userRole', role);
      navigate(`/college/${_id}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };
  
  const handleAddDepartment = () => setRegisterData(prev => ({ ...prev, departments: [...prev.departments, { name: '', code: '' }] }));
  const handleRemoveDepartment = (idx) => setRegisterData(prev => ({ ...prev, departments: prev.departments.filter((_, i) => i !== idx) }));

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
        type: 'college'
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

  const handleRegisterInfoSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setEmailCheckLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/colleges/register/initiate`, {
        name: registerData.name,
        code: registerData.code,
        contactEmail: registerData.contactEmail,
        contactPhone: registerData.contactPhone
      });
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
      const res = await axios.post(`${apiUrl}/api/colleges/register/verify`, {
        email: registerData.contactEmail,
        otp: otpInputs.join(''),
        password,
        confirmPassword
      });
      setRegisterSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        setShowRegister(false);
        setRegisterStep(1);
        setRegisterData(initialRegisterData);
        setOtpInputs(Array(6).fill(''));
        setOtpStatus('idle');
      }, 2000);
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Error completing registration.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendTime(60);
    setRegisterError('');
    setRegisterSuccess('');
    try {
      const res = await axios.post(`${apiUrl}/api/colleges/register/initiate`, {
        name: registerData.name,
        code: registerData.code,
        contactEmail: registerData.contactEmail,
        contactPhone: registerData.contactPhone
      });
      setRegisterSuccess('New OTP sent to your email.');
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Error resending OTP.');
    }
  };

  const renderLoginForm = () => (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group"><label className="form-label" htmlFor="email">Email</label><input className="form-input" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="admin@college.edu" /></div>
      <div className="form-group"><label className="form-label" htmlFor="password">Password</label><input className="form-input" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" /></div>
      <div className="college-login-actions"><a href="/college/forgot-password" className="college-forgot-password-link">Forgot Password?</a></div>
      {error && <div className="login-error-message">{error}</div>}
      <button type="submit" className="login-submit-button" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
    </form>
  );

  const renderRegisterForm = () => (
    <div className={`register-form-anim ${showRegister ? 'show' : ''}`}>
      {registerStep === 1 ? renderStepOne() : renderStepTwo()}
    </div>
  );

  const renderStepOne = () => (
    <form onSubmit={handleRegisterInfoSubmit} className="registration-form">
      <h3>College Details</h3>
      <div className="form-group"><input className="form-input" name="name" value={registerData.name} onChange={handleRegisterChange} required placeholder="College Name" /></div>
      <div className="form-group"><input className="form-input" name="code" value={registerData.code} onChange={handleRegisterChange} required placeholder="College Code" /></div>
      <div className="form-group"><input className="form-input" name="contactEmail" value={registerData.contactEmail} onChange={handleRegisterChange} required placeholder="Contact Email" /></div>
      <div className="form-group"><input className="form-input" name="contactPhone" value={registerData.contactPhone} onChange={handleRegisterChange} required placeholder="Contact Phone" /></div>

      {registerError && <div className="login-error-message">{registerError}</div>}
      <button type="submit" className="login-submit-button" disabled={emailCheckLoading}>{emailCheckLoading ? 'Verifying...' : 'Next'}</button>
      <div className="login-links-container"><button type="button" className="login-link" onClick={() => setShowRegister(false)}>Back to Login</button></div>
    </form>
  );

  const renderStepTwo = () => (
    <form onSubmit={handleRegisterSubmit} className="registration-form">
      <h3>Verify Email & Set Password</h3>
      <p className="login-subtitle">Enter the OTP sent to {registerData.contactEmail}</p>
      <div className="otp-inputs">
        {otpInputs.map((otp, index) => (
          <input
            key={index}
            ref={el => otpInputRefs.current[index] = el}
            className="otp-input form-input"
            type="text"
            maxLength="1"
            value={otp}
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

      <input className="form-input" style={{marginTop: '1rem'}} type="password" name="password" required placeholder="New Password" onChange={handleRegisterChange} />
      <input className="form-input" type="password" name="confirmPassword" required placeholder="Confirm New Password" onChange={handleRegisterChange} />
      <button type="submit" className="login-submit-button" disabled={registerLoading || otpStatus !== 'verified'}>
        {registerLoading ? 'Registering...' : 'Create Account'}
      </button>
      <button type="button" className="login-submit-button back-button" onClick={() => setRegisterStep(1)}>Back</button>
    </form>
  );
  
  return (
    <div className="login-page-wrapper college-login-page">
      <div className="login-form-container">
        <div className="login-header">
          <div className="login-icon-container"><FaUniversity /></div>
          <h1 className="login-title">{showRegister ? 'Register Your College' : 'College Admin Portal'}</h1>
          <p className="login-subtitle">{showRegister ? 'Join our network of institutions.' : 'Access your college dashboard.'}</p>
        </div>

        {!showRegister ? renderLoginForm() : renderRegisterForm()}
        
        <div className="login-links-container">
          {!showRegister && (
            <button onClick={() => setShowRegister(true)} className="login-link">
              Don't have an account? Register College
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

export default CollegeLogin;