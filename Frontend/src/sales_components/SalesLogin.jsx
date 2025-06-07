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
      apiEndpoint="http://localhost:5000/api/sales/email"
      redirectPath="/sales-dashboard"
    />
  );
};

export default SalesLogin; 