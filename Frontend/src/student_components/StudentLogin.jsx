import React from 'react';
import { FaUserGraduate } from 'react-icons/fa';
import LoginForm from '../components/LoginForm';

const StudentLogin = () => {
  return (
    <LoginForm
      type="Student"
      icon={FaUserGraduate}
      color="#3B82F6"
      title="Student Login"
      description="Sign in to access your student dashboard"
      apiEndpoint="https://campusadmin.onrender.com/api/college-students/email"
      redirectPath="/student-dashboard"
    />
  );
};

export default StudentLogin; 