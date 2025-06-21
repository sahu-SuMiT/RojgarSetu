import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaBuilding, FaUniversity, FaChartLine } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'Student Login',
      description: 'Access your student dashboard',
      icon: FaUserGraduate,
      color: '#3B82F6',
      path: '/student-login'
    },
    {
      title: 'College Login',
      description: 'Access your college dashboard',
      icon: FaUniversity,
      color: '#F59E0B',
      path: '/college-login'
    },
    {
      title: 'Company Login',
      description: 'Access your company dashboard',
      icon: FaBuilding,
      color: '#10B981',
      path: '/company-login'
    },
    // {
    //   title: 'Sales Login',
    //   description: 'Access your sales dashboard',
    //   icon: FaChartLine,
    //   color: '#8B5CF6',
    //   path: '/sales-login'
    // }
  ];

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="login-title">ROJGAR SETU</h1>
        <p className="login-subtitle">
          Your one-stop platform for campus placements and career opportunities
        </p>
      </div>

      <div className="login-options-container">
        {loginOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => navigate(option.path)}
            className="login-option-card"
          >
            <div className="login-option-icon" style={{ color: option.color }}>
              <option.icon size={48} />
            </div>
            <h2 className="login-option-title">{option.title}</h2>
            <p className="login-option-description">{option.description}</p>
          </div>
        ))}
      </div>

      <div className="login-footer">
        <p>Don't have an account? Contact your administrator</p>
      </div>
    </div>
  );
};

export default Login; 