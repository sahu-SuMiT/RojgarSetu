import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Target } from 'lucide-react';

const API_URL = "http://localhost:5000"; 

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Only for UI convenience, not authentication
  const studentId = localStorage.getItem('studentId');

  // Redirect to login if studentId missing (optional)
  useEffect(() => {
    if (!studentId) {
      window.location.href = '/auth'; // Or /login if that's your route
    }
  }, [studentId]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/api/students/${studentId}`, {
          method: 'GET',
          credentials: 'include', // CRUCIAL: use session cookie
        });

        if (response.status === 401 || response.status === 403) {
          // Not authenticated or forbidden, redirect to login
          window.location.href = '/auth';
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message || 'Unknown error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchProfileData();
  }, [studentId, isEditing]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Use session cookie
        body: JSON.stringify(profileData),
      });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/auth';
        return;
      }
      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      setProfileData(data);
      setIsEditing(false);
    } catch {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">Error: {error}</div>;
  }

  if (!profileData) {
    return <div className="p-10 text-center text-gray-500">No profile data found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <User className="text-gray-600" size={20} />
            <h1 className="text-lg font-medium text-gray-900">Complete Profile</h1>
          </div>
          <div className="flex space-x-2">
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

      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
              <span className="text-white font-bold text-3xl">
                {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : ''}
              </span>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input type="text" value={profileData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your name" />
                  <input type="text" value={profileData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} className="text-lg text-gray-600 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your title" />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h2>
                  <p className="text-lg text-gray-600 mb-4">{profileData.title}</p>
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
                { label: 'Date of Birth', field: 'dateOfBirth', icon: '📅' },
                { label: 'Gender', field: 'gender', icon: '👤' },
                { label: 'Nationality', field: 'nationality', icon: '🌍' }
              ].map(({ label, field, icon }) => (
                <div key={field} className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">{icon}</span>
                    {label}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
                { label: 'Year', field: 'year', icon: '📖' },
                { label: 'GPA', field: 'gpa', icon: '📊' },
                { label: 'Expected Graduation', field: 'expectedGraduation', icon: '🎯' }
              ].map(({ label, field, icon }) => (
                <div key={field} className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">{icon}</span>
                    {label}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
        </div>
      </div>
    </div>
  );
};

export default Profile;