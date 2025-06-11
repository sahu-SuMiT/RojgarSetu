import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaEdit, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaUserTie, FaCode, FaRulerCombined } from 'react-icons/fa';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CollegeSettingsModal = ({ isOpen, onClose, college, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    placementOfficer: {
      name: '',
      email: '',
      phone: ''
    },
    departments: [],
    establishedYear: '',
    campusSize: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (college) {
      setFormData({
        name: college.name || '',
        code: college.code || '',
        location: college.location || '',
        website: college.website || '',
        contactEmail: college.contactEmail || '',
        contactPhone: college.contactPhone || '',
        placementOfficer: {
          name: college.placementOfficer?.name || '',
          email: college.placementOfficer?.email || '',
          phone: college.placementOfficer?.phone || ''
        },
        departments: college.departments || [],
        establishedYear: college.establishedYear || '',
        campusSize: college.campusSize || ''
      });
    }
  }, [college]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlacementOfficerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      placementOfficer: {
        ...prev.placementOfficer,
        [field]: value
      }
    }));
  };

  const handleDepartmentChange = (index, field, value) => {
    const newDepartments = [...formData.departments];
    newDepartments[index] = {
      ...newDepartments[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      departments: newDepartments
    }));
  };

  const addDepartment = () => {
    setFormData(prev => ({
      ...prev,
      departments: [...prev.departments, { name: '', code: '' }]
    }));
  };

  const removeDepartment = (index) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.put(`${apiUrl}/api/colleges/${college._id}/edit`, formData);
      
      if (response.status === 200) {
        setSuccess(true);
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(response.data);
        }
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update college information');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (college) {
      setFormData({
        name: college.name || '',
        code: college.code || '',
        location: college.location || '',
        website: college.website || '',
        contactEmail: college.contactEmail || '',
        contactPhone: college.contactPhone || '',
        placementOfficer: {
          name: college.placementOfficer?.name || '',
          email: college.placementOfficer?.email || '',
          phone: college.placementOfficer?.phone || ''
        },
        departments: college.departments || [],
        establishedYear: college.establishedYear || '',
        campusSize: college.campusSize || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaBuilding style={{ fontSize: '24px', color: '#6366f1' }} />
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              College Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaSave />
            College information updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Basic Information */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaBuilding />
                Basic Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    College Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    College Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Placement Officer Information */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaUserTie />
                Placement Officer
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={formData.placementOfficer.name}
                    onChange={(e) => handlePlacementOfficerChange('name', e.target.value)}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Officer Email
                  </label>
                  <input
                    type="email"
                    value={formData.placementOfficer.email}
                    onChange={(e) => handlePlacementOfficerChange('email', e.target.value)}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Officer Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.placementOfficer.phone}
                    onChange={(e) => handlePlacementOfficerChange('phone', e.target.value)}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      background: isEditing ? '#fff' : '#f9fafb',
                      color: '#374151',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaGlobe />
              Additional Information
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Established Year *
                </label>
                <input
                  type="number"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: '#374151',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (isEditing) {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (isEditing) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Campus Size (Acres) *
                </label>
                <input
                  type="number"
                  name="campusSize"
                  value={formData.campusSize}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="1"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: '#374151',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (isEditing) {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (isEditing) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
            </div>

            {/* Departments */}
            <div style={{ marginTop: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Departments
                </label>
                {isEditing && (
                  <button
                    type="button"
                    onClick={addDepartment}
                    style={{
                      padding: '6px 12px',
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#5855eb'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
                  >
                    Add Department
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.departments.map((dept, index) => (
                  <div key={index} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr auto', 
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <input
                      type="text"
                      value={dept.name || ''}
                      onChange={(e) => handleDepartmentChange(index, 'name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Department name"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '2px solid #e5e7eb',
                        fontSize: '14px',
                        background: isEditing ? '#fff' : '#f9fafb',
                        color: '#374151',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (isEditing) {
                          e.currentTarget.style.borderColor = '#6366f1';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (isEditing) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    />
                    <input
                      type="text"
                      value={dept.code || ''}
                      onChange={(e) => handleDepartmentChange(index, 'code', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Department code"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '2px solid #e5e7eb',
                        fontSize: '14px',
                        background: isEditing ? '#fff' : '#f9fafb',
                        color: '#374151',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (isEditing) {
                          e.currentTarget.style.borderColor = '#6366f1';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (isEditing) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeDepartment(index)}
                        style={{
                          padding: '8px 12px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {formData.departments.length === 0 && !isEditing && (
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    color: '#6b7280',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    No departments added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '2px solid #f3f4f6'
          }}>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #5855eb 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <FaEdit />
                Edit Information
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: loading ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CollegeSettingsModal; 