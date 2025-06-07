import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserGraduate, 
  FaChevronRight, 
  FaTicketAlt, 
  FaChartLine,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';

const apiUrl = import.meta.env.VITE_API_URL;

const AddStudents = () => {
  const { collegeId } = useParams();
  // const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [students, setStudents] = useState([{
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    batch: '',
    joiningYear: '',
    graduationYear: '',
    cgpa: '',
    skills: [],
    extracurricular: [],
    research: [],
    hackathons: []
  }]);

  const navItems = [
    { label: 'Dashboard', href: `/college/${collegeId}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${collegeId}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${collegeId}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${collegeId}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${collegeId}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${collegeId}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: college?.name || 'College Admin',
    role: 'Administrator',
    initials: college?.name ? college.name.substring(0, 2).toUpperCase() : 'CA'
  };

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/colleges/${collegeId}`);
        setCollege(response.data);
        setLoading(false);
      } catch {
        setError('Error loading college information');
        setLoading(false);
      }
    };

    fetchCollege();
  }, [collegeId]);

  const handleAddStudent = () => {
    setStudents([...students, {
      name: '',
      email: '',
      rollNumber: '',
      department: '',
      batch: '',
      joiningYear: '',
      graduationYear: '',
      cgpa: '',
      skills: [],
      extracurricular: [],
      research: [],
      hackathons: []
    }]);
  };

  const handleRemoveStudent = (index) => {
    const newStudents = [...students];
    newStudents.splice(index, 1);
    setStudents(newStudents);
  };

  const handleStudentChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Add college ID to each student
      const studentsWithCollege = students.map(student => ({
        ...student,
        college: collegeId
      }));

      await axios.post(`${apiUrl}/api/college-students/bulk`, studentsWithCollege);
      setSuccess(true);
      setStudents([{
        name: '',
        email: '',
        rollNumber: '',
        department: '',
        batch: '',
        joiningYear: '',
        graduationYear: '',
        cgpa: '',
        skills: [],
        extracurricular: [],
        research: [],
        hackathons: []
      }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding students');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !college) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
        <div className='main-container' style={{ marginLeft: 260, padding: '2rem' }}>
          <SearchBar />
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
      <div className='main-container' style={{ 
        marginLeft: 260, 
        padding: '1rem',
        width: 'calc(100% - 260px)',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <SearchBar />
        
        <div style={{ 
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Add Students
          </h1>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#dcfce7',
              color: '#059669',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              Students added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {students.map((student, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                    Student {index + 1}
                  </h2>
                  {students.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={student.email}
                      onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={student.rollNumber}
                      onChange={(e) => handleStudentChange(index, 'rollNumber', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Department *
                    </label>
                    <select
                      value={student.department}
                      onChange={(e) => handleStudentChange(index, 'department', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    >
                      <option value="">Select Department</option>
                      {college?.departments?.map(dept => (
                        <option key={dept.code} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Batch *
                    </label>
                    <select
                      value={student.batch}
                      onChange={(e) => handleStudentChange(index, 'batch', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    >
                      <option value="">Select Batch</option>
                      {['1st', '2nd', '3rd', '4th'].map(year => (
                        <option key={year} value={year}>{year} Year</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Joining Year *
                    </label>
                    <input
                      type="number"
                      value={student.joiningYear}
                      onChange={(e) => handleStudentChange(index, 'joiningYear', e.target.value)}
                      required
                      min="2000"
                      max="2100"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      value={student.graduationYear}
                      onChange={(e) => handleStudentChange(index, 'graduationYear', e.target.value)}
                      required
                      min="2000"
                      max="2100"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      CGPA *
                    </label>
                    <input
                      type="number"
                      value={student.cgpa}
                      onChange={(e) => handleStudentChange(index, 'cgpa', e.target.value)}
                      required
                      min="0"
                      max="10"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleAddStudent}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#F59E0B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <FaPlus /> Add Another Student
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Adding Students...' : 'Add Students'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudents; 