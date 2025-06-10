import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaBuilding, FaUserGraduate, FaCalendarAlt, FaClock, FaSearch, FaTrash } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import { formatDistanceToNow } from 'date-fns';
import calculateCampusScore from '../utils/calculateCampusScore';
const apiUrl = import.meta.env.VITE_API_URL;
const ScheduledApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [collegeName, setCollegeName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [showAllStudents, setShowAllStudents] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});
  const location = useLocation();

  // Helper function to highlight text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    const parts = text.toString().split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <span key={i} style={{ background: '#fef08a', padding: '0 2px', borderRadius: '2px' }}>{part}</span> : 
        part
    );
  };

  useEffect(() => {
    const id = localStorage.getItem('collegeId');
    const name = localStorage.getItem('collegeName');
    if (id) {
      setCollegeId(id);
      setCollegeName(name || 'College Admin');
      fetchApplications(id);
    } else {
      setError('College ID not found');
      setLoading(false);
    }
  }, []);

  const fetchApplications = async (id) => {
    try {
      setLoading(true);
      // Use the new optimized endpoint
      const response = await axios.get(`${apiUrl}/api/applications/college/${id}`);
      if (response.data) {
        setApplications(response.data);
        // Store student details from the response
        const studentDetailsMap = {};
        response.data.forEach(app => {
          app.students.forEach(student => {
            if (student.studentId) {
              studentDetailsMap[student.studentId._id] = student.studentId;
            }
          });
        });
        setStudentDetails(studentDetailsMap);
      } else {
        setApplications([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications');
      setLoading(false);
    }
  };

  // Filter applications based on search term with null checks
  const filteredApplications = applications.filter(app => {
    if (!app) return false;
    
    const jobTitle = app.roleId?.jobTitle?.toLowerCase() || '';
    const companyName = app.applicationToCompany?.name?.toLowerCase() || '';
    const studentMatch = app.students?.some(studentObj => {
      const student = studentObj.studentId;
      if (!student) return false;
      const studentName = student.name?.toLowerCase() || '';
      const rollNumber = student.rollNumber?.toLowerCase() || '';
      return studentName.includes(searchTerm.toLowerCase()) || 
             rollNumber.includes(searchTerm.toLowerCase());
    }) || false;

    return jobTitle.includes(searchTerm.toLowerCase()) ||
           companyName.includes(searchTerm.toLowerCase()) ||
           studentMatch;
  });

  // Navigation items with college ID
  const navItems = [
    { label: 'Dashboard', href: `/college/${collegeId}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${collegeId}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${collegeId}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${collegeId}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${collegeId}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${collegeId}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: collegeName || 'College Admin',
    role: 'Administrator',
    initials: collegeName ? collegeName.substring(0, 2).toUpperCase() : 'CA'
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
      await axios.delete(`${apiUrl}/api/applications/${applicationId}`);
      setConfirmingDelete(null);
      fetchApplications(collegeId);
    } catch (err) {
      console.error('Error deleting application:', err);
      setDeleteError('Failed to delete application');
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const renderStudentList = (students, applicationId) => {
    // Ensure students is an array before slicing
    const studentObjects = Array.isArray(students) ? students : [];
    const initialStudents = studentObjects.slice(0, 3);
    const remainingCount = studentObjects.length - 3;

    return (
      <div style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {initialStudents.map(studentObj => (
          studentObj && studentObj.studentId && (
            <div
              key={studentObj.studentId._id}
              style={{
                background: '#f3f4f6',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{studentObj.studentId.name}</span>
              <span style={{ color: '#9ca3af' }}>({studentObj.studentId.rollNumber})</span>
            </div>
          )
        ))}
        {remainingCount > 0 && (
          <button
            onClick={() => {
              setShowAllStudents(applicationId);
              setStudentSearchTerm('');
            }}
            style={{
              background: '#f3f4f6',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: '#6366f1',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
            onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
          >
            +{remainingCount} more
          </button>
        )}
      </div>
    );
  };

  // Modal for showing all students
  const renderAllStudentsModal = (application) => {
    if (!application || !application.students) return null;

    const filteredStudents = application.students.filter(studentObj => {
      const student = studentObj.studentId;
      if (!student) return false;
      const searchTermLower = studentSearchTerm.toLowerCase();
      return student.name?.toLowerCase().includes(searchTermLower) ||
             student.rollNumber?.toLowerCase().includes(searchTermLower) ||
             student.email?.toLowerCase().includes(searchTermLower);
    });

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
        zIndex: 1000
      }}>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '16px',
          width: '500px',
          height: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexShrink: 0
          }}>
            <h3 style={{ margin: 0 }}>Students for {application.roleId?.jobTitle || 'Role'} at {application.applicationToCompany?.name || 'Company'}</h3>
            <button
              onClick={() => setShowAllStudents(null)}
              style={{
                padding: '8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ marginBottom: '15px', position: 'relative' }}>
             <FaSearch style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 16px 8px 40px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#fff'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            flex: 1
          }}>
            {filteredStudents.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>No students found matching your search.</div>
            ) : (
              filteredStudents.map(studentObj => {
                const student = studentObj.studentId;
                const completeStudentData = studentDetails[student._id] || student;
                return ( 
                  student && (
                    <div
                      key={student._id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '15px',
                        background: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#4338ca',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem',
                              fontWeight: 600,
                              flexShrink: 0,
                              boxShadow: '0 2px 4px rgba(67, 56, 202, 0.2)'
                            }}>
                              {calculateCampusScore(completeStudentData)}
                            </div>
                            <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}><b>{highlightText(student.name, studentSearchTerm)}</b></h4>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 3px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                          <b>Roll Number:</b> {highlightText(student.rollNumber, studentSearchTerm)}
                        </p>
                        <p style={{ margin: '0 0 3px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                          <b>Batch:</b> {highlightText(student.batch, studentSearchTerm)}
                        </p>
                        {student.email && (
                          <p style={{ margin: '0 0 3px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                            <b>Email:</b> <i>{highlightText(student.email, studentSearchTerm)}</i>
                          </p>
                        )}
                        {student.resume && (
                          <p style={{ margin: '0 0 3px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                            <a href={student.resume} target="_blank" rel="noopener noreferrer"><b>View Resume</b></a>
                          </p>
                        )}
                        <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '0.875rem' }}>
                          <b>{highlightText(student.department, studentSearchTerm)}</b> • <b>CGPA:</b> {highlightText(student.cgpa, studentSearchTerm)}
                        </p>
                        {student.skills?.length > 0 && (
                          <div style={{ marginTop: '6px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {student.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  style={{
                                    background: '#e0f2f7',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    color: '#0891b2'
                                  }}
                                >
                                  <i>{highlightText(skill, studentSearchTerm)}</i>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!collegeId) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#dc2626'
      }}>
        College ID not found. Please log in again.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COLLEGE SERVICES" />
      <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
        <div style={{ padding: '0 24px' }}>
          <SearchBar />
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px' 
          }}>
            <h2 style={{ color: '#1f2937' }}>Scheduled Applications</h2>
            <div style={{ position: 'relative', width: '300px' }}>
              <FaSearch style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 16px 8px 40px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#fff'
                }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              Loading applications...
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              color: '#dc2626'
            }}>
              {error}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#6b7280' }}>No applications found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredApplications.map(application => (
                <div
                  key={application._id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '1.1rem' }}>
                        {application.applicationToCompany?.name || 'Company Name Not Available'}
                      </h3>
                      <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '0.9rem' }}>
                        Role: {application.roleId?.jobTitle || 'Role Not Specified'}
                      </p>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: application.status === 'active' ? '#d1fae5' : application.status === 'closed' ? '#fee2e2' : '#f3f4f6',
                      color: application.status === 'active' ? '#065f46' : application.status === 'closed' ? '#991b1b' : '#4b5563',
                    }}>
                      {application.status || 'Pending'}
                    </div>
                  </div>

                  <div style={
                    {
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '16px',
                      marginTop: '16px',
                    }
                  }>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      Students:
                    </div>
                    {/* Display initial students and a button to view more */}
                    {renderStudentList(application.students, application._id)}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10,
                  }}>
                    {confirmingDelete === application._id ? (
                      <>
                        <button
                          onClick={() => setConfirmingDelete(null)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#4b5563',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.background = '#f9fafb';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.background = '#fff';
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(application._id)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#dc2626',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#b91c1c')}
                          onMouseOut={(e) => (e.currentTarget.style.background = '#dc2626')}
                        >
                          Confirm Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(application._id)}
                        style={{
                          padding: '8px',
                          border: 'none',
                          borderRadius: '6px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#fecaca')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '#fee2e2')}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for all students */}
        {showAllStudents && renderAllStudentsModal(filteredApplications.find(app => app._id === showAllStudents))}

        {deleteError && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            {deleteError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledApplications; 