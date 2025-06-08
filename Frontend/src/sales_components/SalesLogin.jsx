import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import LoginForm from '../components/LoginForm';

const SalesLogin = () => {
  return (
    <LoginForm
      type="Sales"
      icon={FaChartLine}
      color="#8B5CF6"
      title="Sales Login"
      description="Sign in to access your sales dashboard"
      apiEndpoint="https://campusadmin.onrender.com/api/sales/email"
      redirectPath="/sales-dashboard"
    />
  );
};

export default SalesLogin; 