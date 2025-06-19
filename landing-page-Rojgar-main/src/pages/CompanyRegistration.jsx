import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    industry: '',
    foundedYear: '',
    headquarters: '',
    website: '',
    companySize: '',
    description: '',
    recruiterName: '',
    designation: '',
    department: '',
    workEmail: '',
    personalEmail: '',
    phoneNumber: '',
    alternatePhone: '',
    linkedin: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    annualRevenue: '',
    employeeBenefits: '',
    workCulture: '',
    hiringNeeds: '',
    preferredSkills: '',
    internshipPrograms: '',
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
    console.log('Company registration data:', formData);
    
    const requiredFields = ['companyName', 'recruiterName', 'workEmail', 'phoneNumber', 'industry', 'companySize', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    alert('Company registration successful! Welcome to Campus Connect!');
    navigate('/company-portal');
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
            <CardTitle className="text-2xl text-center">Company Registration</CardTitle>
            <p className="text-center text-gray-600">Register your company to access top talent from colleges</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <input 
                      type="text" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Type</label>
                    <select 
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Select Type</option>
                      <option value="startup">Startup</option>
                      <option value="sme">SME</option>
                      <option value="mnc">MNC</option>
                      <option value="public">Public Sector</option>
                      <option value="nonprofit">Non-Profit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry *</label>
                    <select 
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance & Banking</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                      <option value="consulting">Consulting</option>
                      <option value="automotive">Automotive</option>
                      <option value="pharmaceuticals">Pharmaceuticals</option>
                      <option value="telecommunications">Telecommunications</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Founded Year</label>
                    <input 
                      type="number" 
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      min="1800"
                      max="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Headquarters</label>
                    <input 
                      type="text" 
                      name="headquarters"
                      value={formData.headquarters}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., Bangalore, India"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input 
                      type="url" 
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="https://www.company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Size *</label>
                    <select 
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Annual Revenue</label>
                    <select 
                      name="annualRevenue"
                      value={formData.annualRevenue}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Select Range</option>
                      <option value="<1cr">Less than ₹1 Crore</option>
                      <option value="1-10cr">₹1-10 Crores</option>
                      <option value="10-100cr">₹10-100 Crores</option>
                      <option value="100-1000cr">₹100-1000 Crores</option>
                      <option value=">1000cr">More than ₹1000 Crores</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Company Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="3"
                      placeholder="Brief description about your company"
                    />
                  </div>
                </div>
              </div>

              {/* Recruiter Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Recruiter Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Recruiter Name *</label>
                    <input 
                      type="text" 
                      name="recruiterName"
                      value={formData.recruiterName}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Designation</label>
                    <input 
                      type="text" 
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., HR Manager, Talent Acquisition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <input 
                      type="text" 
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., Human Resources, Talent Acquisition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Email *</label>
                    <input 
                      type="email" 
                      name="workEmail"
                      value={formData.workEmail}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Personal Email</label>
                    <input 
                      type="email" 
                      name="personalEmail"
                      value={formData.personalEmail}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternate Phone</label>
                    <input 
                      type="tel" 
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
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
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Company Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Complete Address</label>
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="Enter complete office address"
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
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input 
                      type="text" 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., India"
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

              {/* Hiring Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Hiring Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Hiring Needs</label>
                    <textarea 
                      name="hiringNeeds"
                      value={formData.hiringNeeds}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="e.g., Software Engineers, Data Scientists, Marketing Interns"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Skills</label>
                    <textarea 
                      name="preferredSkills"
                      value={formData.preferredSkills}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="e.g., Python, React, Machine Learning, Digital Marketing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Internship Programs</label>
                    <textarea 
                      name="internshipPrograms"
                      value={formData.internshipPrograms}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="Describe your internship programs and opportunities"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Employee Benefits</label>
                    <textarea 
                      name="employeeBenefits"
                      value={formData.employeeBenefits}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="e.g., Health Insurance, Flexible Working, Learning Budget"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Culture</label>
                    <textarea 
                      name="workCulture"
                      value={formData.workCulture}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="Describe your company's work culture and values"
                    />
                  </div>
                </div>
              </div>

              {/* Account Security */}
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

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Register Company</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyRegistration;
