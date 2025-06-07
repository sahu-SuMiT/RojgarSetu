import React, { useState, useEffect } from 'react';
import SearchBar from '../SearchBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FaTicketAlt, FaChartLine, FaChevronRight, FaUserGraduate } from 'react-icons/fa';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from '../Sidebar';
import axios from 'axios';
import calculateCampusScore from '../utils/calculateCampusScore';

const apiUrl = import.meta.env.VITE_API_URL;

// const collegeLinks = [
//   { label: 'Track Student Performance', href: '/college-dashboard' },
//   { label: 'Access Feedback & Scores', href: '/college-dashboard/feedback' },
//   { label: 'Edit & Update Student Profile Record', href: '/college-dashboard/update-profile' }
// ];

// const yearOptions = ['All', '1st', '2nd', '3rd', '4th'];

// const navItems = [
//   { label: 'Dashboard', href: '/college-dashboard', icon: <FaChevronRight /> },
//   { label: 'View Jobs', href: '/college-dashboard/view-jobs', icon: <FaChevronRight /> },
//   { label: 'Student Applications', href: '/college-dashboard/student-applications', icon: <FaChevronRight /> },
//   { label: 'Add Students', href: '/college-dashboard/add-students', icon: <FaUserGraduate /> },
//   { label: 'Support', href: '/support', icon: <FaTicketAlt /> },
//   { label: 'Placement Analysis', href: '/placement-analysis', icon: <FaChartLine /> },
// ];
const sidebarUser = { initials: 'AJ', name: 'Alex Johnson', role: 'Student' };

const CollegeDashboard = () => {
  const location = useLocation();
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [college, setCollege] = useState(null);
  const studentsPerPage = 10;

  // Get college ID from URL params or localStorage
  const getCollegeId = () => {
    const collegeId = localStorage.getItem('collegeId');
    if (!collegeId) {
      // If no collegeId in localStorage, try to get from URL
      const params = new URLSearchParams(location.search);
      const urlCollegeId = params.get('collegeId');
      if (urlCollegeId) {
        localStorage.setItem('collegeId', urlCollegeId);
        return urlCollegeId;
      }
      return null;
    }
    return collegeId;
  };

  const collegeId = getCollegeId();

  // Navigation items with college ID
  const navItems = [
    { label: 'Dashboard', href: `/college/${collegeId}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${collegeId}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${collegeId}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${collegeId}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${collegeId}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${collegeId}/placement-analysis`, icon: <FaChartLine /> },
  ];

  useEffect(() => {
    if (!collegeId) {
      setError('Please log in as a college to access this dashboard');
      setLoading(false);
      return;
    }

    // Fetch college details
    axios.get(`${apiUrl}/api/colleges/${collegeId}`)
      .then(res => {
        setCollege(res.data);
        // Update sidebar user info
        sidebarUser.initials = res.data.name.substring(0, 2).toUpperCase();
        sidebarUser.name = res.data.name;
        sidebarUser.role = 'College Admin';
      })
      .catch(err => {
        console.error('Error fetching college:', err);
        setError('Error loading college information');
      });

    // Fetch students for this college
    setLoading(true);
    setError(null);
    axios.get(`${apiUrl}/api/college-students/college/${collegeId}`)
      .then(res => {
        setStudents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching students.');
        setLoading(false);
      });
  }, [collegeId]); // Add collegeId as dependency

  const departments = ['All', ...Array.from(new Set(students.map(s => s.department || 'Unknown')))];

  // Filter students globally by department and year
  const filteredStudents = students.filter(student => {
    const matchesDepartment = selectedDepartment === 'All' || student.department === selectedDepartment;
    const matchesYear = selectedYear === 'All' || student.batch === selectedYear;
    return matchesDepartment && matchesYear;
  });

  // All stats and analytics use filteredStudents
  const calculateMetrics = (students) => {
    const metrics = {
      totalStudents: students.length,
      jobsApplied: students.filter(s => s.applications && s.applications.length > 0).length,
      jobsSelected: students.filter(s => s.applications && s.applications.some(app => app.status === 'selected')).length,
      internsApplied: students.filter(s => s.internships && s.internships.length > 0).length,
      internsSelected: students.filter(s => s.internships && s.internships.some(intern => intern.status === 'selected')).length,
      avgCampusScore: students.length > 0 ? 
        (students.reduce((sum, s) => sum + Number(calculateCampusScore(s)), 0) / students.length).toFixed(1) : '0.0',
      avgCGPA: students.length > 0 ? 
        (students.reduce((sum, s) => sum + (s.cgpa || 0), 0) / students.length).toFixed(2) : '0.00',
      departmentStats: {},
      campusComparison: {
        onCampus: {
          count: 0,
          totalScore: 0,
          avgScore: 0
        },
        offCampus: {
          count: 0,
          totalScore: 0,
          avgScore: 0
        }
      },
      companiesVisited: students.filter(s => s.companies && s.companies.length > 0).length,
    };

    // Calculate department-wise statistics and campus comparison
    students.forEach(student => {
      // Department stats calculation
      if (!metrics.departmentStats[student.department]) {
        metrics.departmentStats[student.department] = {
          count: 0,
          totalCGPA: 0,
          totalCampusScore: 0,
          jobsApplied: 0,
          jobsSelected: 0,
          internsApplied: 0,
          internsSelected: 0
        };
      }
      
      const dept = metrics.departmentStats[student.department];
      dept.count++;
      dept.totalCGPA += student.cgpa || 0;
      dept.totalCampusScore += Number(calculateCampusScore(student));
      dept.jobsApplied += student.applications?.length || 0;
      dept.jobsSelected += student.applications?.filter(app => app.status === 'selected').length || 0;
      dept.internsApplied += student.internships?.length || 0;
      dept.internsSelected += student.internships?.filter(intern => intern.status === 'selected').length || 0;

      // Campus comparison calculation
      const campusScore = Number(calculateCampusScore(student));
      if (student.placementType === 'onCampus') {
        metrics.campusComparison.onCampus.count++;
        metrics.campusComparison.onCampus.totalScore += campusScore;
      } else {
        metrics.campusComparison.offCampus.count++;
        metrics.campusComparison.offCampus.totalScore += campusScore;
      }
    });

    // Calculate averages for each department
    Object.keys(metrics.departmentStats).forEach(dept => {
      const stats = metrics.departmentStats[dept];
      stats.avgCGPA = (stats.totalCGPA / stats.count).toFixed(2);
      stats.avgCampusScore = (stats.totalCampusScore / stats.count).toFixed(1);
      stats.jobSelectionRate = stats.jobsApplied > 0 ? ((stats.jobsSelected / stats.jobsApplied) * 100).toFixed(1) : 0;
      stats.internSelectionRate = stats.internsApplied > 0 ? ((stats.internsSelected / stats.internsApplied) * 100).toFixed(1) : 0;
    });

    // Calculate campus comparison averages
    metrics.campusComparison.onCampus.avgScore = metrics.campusComparison.onCampus.count > 0 
      ? (metrics.campusComparison.onCampus.totalScore / metrics.campusComparison.onCampus.count).toFixed(1) 
      : '0.0';
    metrics.campusComparison.offCampus.avgScore = metrics.campusComparison.offCampus.count > 0 
      ? (metrics.campusComparison.offCampus.totalScore / metrics.campusComparison.offCampus.count).toFixed(1) 
      : '0.0';

    return metrics;
  };

  const metrics = calculateMetrics(filteredStudents);

  const handleEditStudent = (student) => {
    setEditingId(student._id);
    setEditForm({
      name: student.name,
      email: student.email,
      department: student.department,
      cgpa: student.cgpa,
      batch: student.batch,
      skills: student.skills ? student.skills.join(', ') : '',
      extracurricular: student.extracurricular ? student.extracurricular.map(e => e.activity).join(', ') : '',
      remark: student.remark || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveStudent = async (id) => {
    try {
      const updated = {
        ...editForm,
        cgpa: Number(editForm.cgpa),
        skills: editForm.skills.split(',').map(s => s.trim()),
        extracurricular: editForm.extracurricular.split(',').map(a => ({ activity: a.trim(), role: '', achievement: '' })),
        remark: editForm.remark,
      };
      await axios.put(`${apiUrl}/api/student/${id}`, updated);
      setStudents(students => students.map(s => s._id === id ? { ...s, ...updated } : s));
      setEditingId(null);
    } catch {
      alert('Error saving student.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase())).length / studentsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
      <div className='main-container' style={{ 
        marginLeft: 260,
        height: '100vh', 
        overflowY: 'auto',
        flex: 1,
        minWidth: 0,
        padding: '0 1rem',
      }}>
        <SearchBar />
        <div style={{ padding: '1.5rem 0' }}>
              <div style={{ 
                display: 'flex', 
            justifyContent: 'space-between', 
                alignItems: 'center',
            marginBottom: '1.5rem',
                background: '#fff',
                padding: '1.2rem 2rem',
                borderRadius: 14,
                boxShadow: '0 2px 12px #0001',
                borderLeft: '5px solid #6366f1',
                width: '100%',
            gap: '2rem'
          }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
                {college ? `${college.name} Dashboard` : 'College Dashboard'}
              </h1>
              <p style={{ color: '#6b7280', fontSize: 14 }}>
                {college ? `Track and manage student performance for ${college.name}` : 'Loading college information...'}
              </p>
            </div>

            {/* Filter Controls */}
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              alignItems: 'center',
              flexWrap: 'wrap',
              flex: 1,
              justifyContent: 'flex-end'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{ fontWeight: 600, color: '#4b5563', minWidth: 100 }}>Department:</label>
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      minWidth: 200,
                      fontSize: '0.95rem',
                      color: '#1f2937',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{ fontWeight: 600, color: '#4b5563', minWidth: 100 }}>Year:</label>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      minWidth: 200,
                      fontSize: '0.95rem',
                      color: '#1f2937',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                  {['All', '1st', '2nd', '3rd', '4th'].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
              </div>
                </div>
              </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading students...</div>
          ) : error ? (
              <div style={{
              textAlign: 'center', 
              padding: '2rem',
              background: '#fee2e2',
              borderRadius: '8px',
              margin: '1rem 0',
              color: '#dc2626'
            }}>
              {error}
              {error.includes('log in') && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/login" style={{
                    padding: '0.5rem 1rem',
                    background: '#dc2626',
                    color: 'white',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}>
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <h2 style={{ 
                fontWeight: 700, 
                color: '#6366f1', 
                marginBottom: 16,
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaChartLine /> Placement & Internship Summary
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
                width: '100%'
              }}>
                {/* Overall Campus Score Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  borderRadius: 16,
                  padding: '1.5rem',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: 200
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>Overall Campus Score</div>
                  <div style={{ 
                    fontSize: 48, 
                    fontWeight: 800, 
                    margin: '1rem 0',
                    background: 'rgba(255, 255, 255, 0.1)',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    {metrics.avgCampusScore}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>Average of all student scores</div>
                </div>

                {/* Campus Comparison Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>Campus Score Comparison</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: '0.5rem' }}>On Campus</div>
                      <div style={{ 
                        fontSize: 32, 
                        fontWeight: 700, 
                        color: '#4338ca',
                        background: '#f3f4f6',
                        padding: '0.5rem 1rem',
                        borderRadius: 8
                      }}>
                        {metrics.campusComparison.onCampus.avgScore}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: '0.5rem' }}>
                        {metrics.campusComparison.onCampus.count} students
                      </div>
                    </div>
                    <div style={{ 
                      width: 1, 
                      height: 60, 
                      background: '#e5e7eb',
                      margin: '0 1rem'
                    }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: '0.5rem' }}>Off Campus</div>
                      <div style={{ 
                        fontSize: 32, 
                        fontWeight: 700, 
                        color: '#059669',
                        background: '#f3f4f6',
                        padding: '0.5rem 1rem',
                        borderRadius: 8
                      }}>
                        {metrics.campusComparison.offCampus.avgScore}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: '0.5rem' }}>
                        {metrics.campusComparison.offCampus.count} students
                      </div>
                    </div>
                  </div>
                </div>

                {/* Companies Visited Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderLeft: '5px solid #4338ca'
                }}>
                  <div style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: '#4338ca',
                    marginBottom: '1rem'
                  }}>
                    Companies Visited
                  </div>
                  <div style={{ 
                    fontSize: 36, 
                    fontWeight: 800, 
                    color: '#1f2937',
                    margin: '1rem 0',
                    background: '#f3f4f6',
                    padding: '0.5rem 2rem',
                    borderRadius: 8
                  }}>
                    {metrics.companiesVisited || 0}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Total Companies</div>
                </div>
              </div>

              {/* Second Row of Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
                width: '100%'
              }}>
                {/* Jobs Applied Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderLeft: '5px solid #43a047'
                }}>
                  <div style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: '#43a047',
                    marginBottom: '1rem'
                  }}>
                    Jobs Applied
                  </div>
                  <div style={{ 
                    fontSize: 36, 
                    fontWeight: 800, 
                    color: '#1f2937',
                    margin: '1rem 0',
                    background: '#f3f4f6',
                    padding: '0.5rem 2rem',
                    borderRadius: 8
                  }}>
                    {metrics.jobsApplied}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Total Applications</div>
                </div>

                {/* Interns Applied Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderLeft: '5px solid #f59e42'
                }}>
                  <div style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: '#f59e42',
                    marginBottom: '1rem'
                  }}>
                    Interns Applied
                  </div>
                  <div style={{ 
                    fontSize: 36, 
                    fontWeight: 800, 
                    color: '#1f2937',
                    margin: '1rem 0',
                    background: '#f3f4f6',
                    padding: '0.5rem 2rem',
                    borderRadius: 8
                  }}>
                    {filteredStudents.length}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Total Students</div>
                </div>

                {/* Selection % Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderLeft: '5px solid #3b82f6'
                }}>
                  <div style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: '#3b82f6',
                    marginBottom: '1rem'
                  }}>
                    Selection Rate
                  </div>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '100%'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: 24, 
                        fontWeight: 700, 
                        color: '#4338ca',
                        background: '#f3f4f6',
                        padding: '0.5rem 1rem',
                        borderRadius: 8,
                        marginBottom: '0.5rem'
                      }}>
                        Jobs: {filteredStudents.length > 0 ? ((filteredStudents.filter(s => (s.cgpa || 0) > 85).length / filteredStudents.length) * 100).toFixed(1) : '0.0'}%
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 14 }}>Job Selection Rate</div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: 24, 
                        fontWeight: 700, 
                        color: '#059669',
                        background: '#f3f4f6',
                        padding: '0.5rem 1rem',
                        borderRadius: 8,
                        marginBottom: '0.5rem'
                      }}>
                        Interns: {filteredStudents.length > 0 ? ((filteredStudents.filter(s => (s.cgpa || 0) > 80).length / filteredStudents.length) * 100).toFixed(1) : '0.0'}%
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 14 }}>Intern Selection Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cards */}
              <h2 style={{ 
                fontWeight: 700, 
                color: '#1f2937', 
                marginBottom: 16,
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaChartLine /> Department-wise Analytics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
                width: '100%'
              }}>
                {/* Department-wise Avg CGPA Bar Chart Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderTop: '4px solid #8884d8',
                }}>
                  <h3 style={{ 
                    marginBottom: 16, 
                    color: '#8884d8', 
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>Avg CGPA by Department</h3>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={Object.entries(metrics.departmentStats).map(([dept, stats]) => ({
                          department: dept,
                          avgCGPA: Number(stats.avgCGPA)
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="department" stroke="#6b7280" />
                        <YAxis domain={[0, 10]} stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="avgCGPA" 
                          fill="#8884d8" 
                          name="Average CGPA"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderTop: '4px solid #82ca9d',
                }}>
                  <h3 style={{ 
                    marginBottom: 16, 
                    color: '#82ca9d', 
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>Performance vs CGPA</h3>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Avg Campus Score', value: Number(metrics.avgCampusScore) },
                            { name: 'Avg CGPA', value: Number(metrics.avgCGPA) * 10 },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label
                        >
                          <Cell fill="#6366f1" />
                          <Cell fill="#82ca9d" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Department-wise Avg Performance Line Chart Card */}
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderTop: '4px solid #f59e42',
                }}>
                  <h3 style={{ 
                    marginBottom: 16, 
                    color: '#f59e42', 
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>Avg Campus Score by Department</h3>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={Object.entries(metrics.departmentStats).map(([dept, stats]) => ({
                          department: dept,
                          avgCampusScore: Number(stats.avgCampusScore)
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="department" stroke="#6b7280" />
                        <YAxis domain={[0, 10]} stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="avgCampusScore" 
                          stroke="#f59e42" 
                          name="Avg Campus Score" 
                          strokeWidth={3} 
                          dot={{ r: 5, fill: '#f59e42' }}
                          activeDot={{ r: 8, fill: '#f59e42' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Student List Table */}
              <div style={{ 
                borderRadius: 8, 
                border: '1px solid #e2e8f0',
                width: '100%',
                overflowX: 'auto'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  textAlign: 'left',
                  minWidth: 800
                }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Year</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>CGPA</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Campus Score</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student, index) => {
                      const campusScore = calculateCampusScore(student);
                      const isEditing = editingId === student._id;
                      return (
                        <tr key={student._id} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={{ padding: '12px 16px' }}>
                            {isEditing ? (
                              <input name="name" value={editForm.name} onChange={handleEditChange} style={{ width: '100%' }} />
                            ) : (
                              <Link to={`/college/${collegeId}/student/${student._id}`} className="student-name">{student.name}</Link>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {isEditing ? (
                              <input name="department" value={editForm.department} onChange={handleEditChange} style={{ width: '100%' }} />
                            ) : student.department}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {isEditing ? (
                              <input name="batch" value={editForm.batch} onChange={handleEditChange} style={{ width: 60 }} />
                            ) : student.batch}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {isEditing ? (
                              <input name="cgpa" value={editForm.cgpa} onChange={handleEditChange} style={{ width: 50 }} />
                            ) : student.cgpa}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{campusScore}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {isEditing ? (
                              <>
                                <button onClick={() => handleSaveStudent(student._id)} style={{ marginRight: 8, background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600 }}>Save</button>
                                <button onClick={handleCancelEdit} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600 }}>Cancel</button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEditStudent(student)}
                                style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                              >
                                Edit Profile
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '2rem', 
                marginBottom: '4rem', 
                gap: '1rem',
              }}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === 1 ? '#ccc' : '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600
                  }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === totalPages ? '#ccc' : '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 600
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;
