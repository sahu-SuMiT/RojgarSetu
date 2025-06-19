import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CollegeRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    collegeName: '',
    establishedYear: '',
    collegeType: '',
    affiliation: '',
    contactPersonName: '',
    designation: '',
    department: '',
    officialEmail: '',
    alternateEmail: '',
    phoneNumber: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    website: '',
    totalStudents: '',
    totalFaculty: '',
    coursesOffered: '',
    placementRecord: '',
    accreditation: '',
    facilities: '',
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
    console.log('College registration data:', formData);
    
    const requiredFields = ['collegeName', 'contactPersonName', 'officialEmail', 'phoneNumber', 'city', 'state', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    alert('College registration successful! Welcome to Campus Connect!');
    navigate('/college-portal');
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
            <CardTitle className="text-2xl text-center">College Registration</CardTitle>
            <p className="text-center text-gray-600">Register your institution to connect with students and companies</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Institution Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">College/University Name *</label>
                    <input 
                      type="text" 
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Established Year</label>
                    <input 
                      type="number" 
                      name="establishedYear"
                      value={formData.establishedYear}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      min="1800"
                      max="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">College Type</label>
                    <select 
                      name="collegeType"
                      value={formData.collegeType}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Select Type</option>
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                      <option value="autonomous">Autonomous</option>
                      <option value="deemed">Deemed University</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Affiliation/University</label>
                    <input 
                      type="text" 
                      name="affiliation"
                      value={formData.affiliation}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., Anna University, AICTE"
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
                      placeholder="https://www.college.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Accreditation</label>
                    <input 
                      type="text" 
                      name="accreditation"
                      value={formData.accreditation}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      placeholder="e.g., NAAC A+, NBA"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Contact Person Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Person Name *</label>
                    <input 
                      type="text" 
                      name="contactPersonName"
                      value={formData.contactPersonName}
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
                      placeholder="e.g., Placement Officer, Dean"
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
                      placeholder="e.g., Training & Placement"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Official Email *</label>
                    <input 
                      type="email" 
                      name="officialEmail"
                      value={formData.officialEmail}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternate Email</label>
                    <input 
                      type="email" 
                      name="alternateEmail"
                      value={formData.alternateEmail}
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
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Complete Address</label>
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="Enter complete address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input 
                      type="text" 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      required
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

              {/* Institution Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Institution Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Students</label>
                    <input 
                      type="number" 
                      name="totalStudents"
                      value={formData.totalStudents}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Faculty</label>
                    <input 
                      type="number" 
                      name="totalFaculty"
                      value={formData.totalFaculty}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Courses Offered</label>
                    <textarea 
                      name="coursesOffered"
                      value={formData.coursesOffered}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="e.g., B.Tech, MBA, BCA, M.Tech"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Placement Record</label>
                    <textarea 
                      name="placementRecord"
                      value={formData.placementRecord}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="Brief about placement statistics and top recruiters"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Facilities & Infrastructure</label>
                    <textarea 
                      name="facilities"
                      value={formData.facilities}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg" 
                      rows="2"
                      placeholder="e.g., Library, Labs, Hostels, Sports Complex"
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

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Register College</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollegeRegistration;
