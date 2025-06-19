import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    college: '',
    course: '',
    specialization: '',
    graduationYear: '',
    currentYear: '',
    cgpa: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    skills: '',
    projects: '',
    internships: '',
    linkedin: '',
    github: '',
    portfolio: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Student registration data:', formData);
    
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'college', 'course', 'graduationYear', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    alert('Registration successful! Welcome to Campus Connect!');
    navigate('/student-portal');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/get-started')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <img src="/images/favicon.png" alt="Rojgar Setu Logo" className="w-16 h-16 rounded-full border border-blue-200 shadow bg-white mb-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Student Registration</CardTitle>
            <p className="text-center text-gray-600">Create your profile to start your career journey</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <input 
                      type="date" 
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">College/University *</label>
                    <input 
                      type="text" 
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course/Degree *</label>
                    <input 
                      type="text" 
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., B.Tech, MBA, BCA"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Specialization</label>
                    <input 
                      type="text" 
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., Computer Science, Marketing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Graduation Year *</label>
                    <input 
                      type="number" 
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Year</label>
                    <select 
                      name="currentYear"
                      value={formData.currentYear}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Select Year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CGPA/Percentage</label>
                    <input 
                      type="text" 
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., 8.5 or 85%"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="Enter your full address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input 
                      type="text" 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode</label>
                    <input 
                      type="text" 
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Professional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills</label>
                    <textarea 
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="e.g., Python, JavaScript, React, Data Analysis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Projects</label>
                    <textarea 
                      name="projects"
                      value={formData.projects}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="3"
                      placeholder="Describe your projects"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Internship Experience</label>
                    <textarea 
                      name="internships"
                      value={formData.internships}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="Describe your internship experience"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                    <input 
                      type="url" 
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub Profile</label>
                    <input 
                      type="url" 
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Portfolio Website</label>
                    <input 
                      type="url" 
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Account Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Create Account</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentRegistration;
