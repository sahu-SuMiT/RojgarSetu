import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Portfolio+User&background=0D8ABC&color=fff&size=256';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fetchPortfolioData = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/portfolio/generate`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    const data = await response.json();
    return data.portfolio || null;
  } catch {
    return null;
  }
};

// Helper to get the real student profile image URL
function getStudentProfileImageUrl(studentId) {
  return studentId
    ? `http://localhost:5000/api/studentsProfile/${studentId}/profile-pic`
    : DEFAULT_AVATAR;
}

const PortfolioView = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get studentId from portfolio or localStorage
  const studentId = portfolio?.personalInfo?.studentId || localStorage.getItem('studentId');

  // Helper to get the correct image for both web and PDF
  const getProfileImgSrc = () => {
    const photo = portfolio?.personalInfo?.profilePhoto;
    if (photo && !photo.includes('ui-avatars.com')) {
      return photo;
    }
    if (studentId) {
      return getStudentProfileImageUrl(studentId);
    }
    return DEFAULT_AVATAR;
  };

  useEffect(() => {
    const local = localStorage.getItem('portfolioData');
    if (local) {
      setPortfolio(JSON.parse(local));
      setLoading(false);
    } else {
      fetchPortfolioData().then(data => {
        if (data) {
          setPortfolio(data);
          localStorage.setItem('portfolioData', JSON.stringify(data));
        } else {
          setError('Could not load portfolio data.');
        }
        setLoading(false);
      });
    }
  }, []);

  const handleDownloadPDF = async () => {
    // Create a plain container for PDF export
    const pdfDiv = document.createElement('div');
    pdfDiv.style.background = '#fff';
    pdfDiv.style.color = '#000';
    pdfDiv.style.fontFamily = 'Arial, sans-serif';
    pdfDiv.style.fontSize = '16px';
    pdfDiv.style.padding = '32px';
    pdfDiv.style.width = '800px';
    pdfDiv.style.maxWidth = '100%';
    pdfDiv.style.lineHeight = '1.5';

    // Add content: image, name, title, email, phone, location, about, education, skills, projects
    let html = '';
    if (portfolio?.personalInfo) {
      html += `<div style="text-align:center;margin-bottom:24px;">`;
      const imgSrc = getProfileImgSrc();
      html += `<img src="${imgSrc}" alt="Profile" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:2px solid #eee;margin-bottom:12px;" onerror="this.src='${DEFAULT_AVATAR}'" />`;
      html += `<h1 style="font-size:2em;font-weight:bold;margin:8px 0 4px 0;">${portfolio.personalInfo.name || ''}</h1>`;
      html += `<div style="font-size:1.1em;margin-bottom:8px;">${portfolio.personalInfo.title || ''}</div>`;
      html += `<div style="font-size:1em;color:#333;">${portfolio.personalInfo.email || ''} | ${portfolio.personalInfo.phone || ''} | ${portfolio.personalInfo.location || ''}</div>`;
      html += `</div>`;
      if (portfolio.personalInfo.careerObjective) {
        html += `<div style="margin-bottom:18px;"><strong>About:</strong> ${portfolio.personalInfo.careerObjective}</div>`;
      }
    }
    if (portfolio?.education) {
      html += `<div style="margin-bottom:18px;"><strong>Education:</strong><ul style="margin:6px 0 0 18px;">`;
      if (portfolio.education.degree) html += `<li>Degree: ${portfolio.education.degree}</li>`;
      if (portfolio.education.major) html += `<li>Major: ${portfolio.education.major}</li>`;
      if (portfolio.education.year) html += `<li>Year: ${portfolio.education.year}</li>`;
      if (portfolio.education.cgpa) html += `<li>CGPA: ${portfolio.education.cgpa}</li>`;
      if (portfolio.education.expectedGraduation) html += `<li>Expected Graduation: ${portfolio.education.expectedGraduation}</li>`;
      if (portfolio.education.department) html += `<li>Department: ${portfolio.education.department}</li>`;
      html += `</ul></div>`;
    }
    if (portfolio?.skills) {
      html += `<div style="margin-bottom:18px;"><strong>Skills:</strong> `;
      if (portfolio.skills.skills?.length) html += `<span>${portfolio.skills.skills.join(', ')}</span>`;
      if (portfolio.skills.programmingLanguages?.length) html += `<br/><span>Programming: ${portfolio.skills.programmingLanguages.join(', ')}</span>`;
      if (portfolio.skills.technologies?.length) html += `<br/><span>Technologies: ${portfolio.skills.technologies.join(', ')}</span>`;
      html += `</div>`;
    }
    if (portfolio?.projects?.length) {
      html += `<div style="margin-bottom:18px;"><strong>Projects & Achievements:</strong><ul style="margin:6px 0 0 18px;">`;
      portfolio.projects.forEach(project => {
        html += `<li><strong>${project.name}</strong>: ${project.description || ''}`;
        if (project.technologies?.length) html += ` <span style='color:#333'>(Tech: ${project.technologies.join(', ')})</span>`;
        html += `</li>`;
      });
      html += `</ul></div>`;
    }
    if (portfolio?.certifications?.length) {
      html += `<div style="margin-bottom:18px;"><strong>Certifications:</strong><ul style="margin:6px 0 0 18px;">`;
      portfolio.certifications.forEach(cert => {
        html += `<li><strong>${cert.name}</strong> (${cert.issuer || ''}${cert.date ? ', ' + new Date(cert.date).toLocaleDateString() : ''})`;
        if (cert.link) html += ` <a href='${cert.link}' style='color:#2563eb;text-decoration:underline;'>[Link]</a>`;
        html += `</li>`;
      });
      html += `</ul></div>`;
    }
    if (portfolio?.extracurricular?.length) {
      html += `<div style="margin-bottom:18px;"><strong>Extracurricular Activities:</strong><ul style="margin:6px 0 0 18px;">`;
      portfolio.extracurricular.forEach(item => {
        html += `<li>${item.activity || ''}${item.role ? ' (' + item.role + ')' : ''}${item.achievement ? ': ' + item.achievement : ''}</li>`;
      });
      html += `</ul></div>`;
    }
    if (portfolio?.research?.length) {
      html += `<div style="margin-bottom:18px;"><strong>Research:</strong><ul style="margin:6px 0 0 18px;">`;
      portfolio.research.forEach(item => {
        html += `<li><strong>${item.title}</strong>${item.year ? ' (' + item.year + ')' : ''}${item.role ? ', ' + item.role : ''}${item.description ? ': ' + item.description : ''}</li>`;
      });
      html += `</ul></div>`;
    }
    if (portfolio?.hackathons?.length) {
      html += `<div style="margin-bottom:18px;"><strong>Hackathons:</strong><ul style="margin:6px 0 0 18px;">`;
      portfolio.hackathons.forEach(item => {
        html += `<li><strong>${item.name}</strong>${item.year ? ' (' + item.year + ')' : ''}${item.achievement ? ': ' + item.achievement : ''}${item.description ? ' - ' + item.description : ''}</li>`;
      });
      html += `</ul></div>`;
    }
    pdfDiv.innerHTML = html;

    // Hide the div off-screen
    pdfDiv.style.position = 'fixed';
    pdfDiv.style.left = '-9999px';
    pdfDiv.style.top = '0';
    document.body.appendChild(pdfDiv);

    // Wait for image(s) to load
    const imgs = pdfDiv.querySelectorAll('img');
    const imgPromises = Array.from(imgs).map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(resolve => { img.onload = img.onerror = () => resolve(); });
    });
    await Promise.all(imgPromises);
    await new Promise(res => setTimeout(res, 200));

    // Render to canvas and PDF
    try {
      const canvas = await html2canvas(pdfDiv, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${portfolio?.personalInfo?.name || 'Portfolio'}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      document.body.removeChild(pdfDiv);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-white text-xl flex items-center gap-3"
      >
        <div className="w-5 h-5 rounded-full bg-indigo-500 animate-pulse"></div>
        Loading...
      </motion.div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-red-300 text-xl p-6 bg-red-900/20 rounded-xl border border-red-500/30"
      >
        {error}
      </motion.div>
    </div>
  );
  
  if (!portfolio) return null;

  const { personalInfo, education, skills, projects } = portfolio;

  return (
    <div id="portfolio-root" className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col items-center px-4 py-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center mb-10 mt-4 border border-white/10"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20"></div>
          <img
            src={getProfileImgSrc()}
            alt="Profile"
            className="w-32 h-32 rounded-full border-2 border-indigo-400/50 shadow-lg mb-6 object-cover bg-white relative z-10"
            onError={e => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-3 text-center">
          {personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-indigo-200/80 text-lg mb-4 text-center max-w-2xl">
          {personalInfo?.title || 'Student'}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-slate-300 text-sm">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-white/5 rounded-full border border-white/10"
          >
            {personalInfo?.email || 'email@example.com'}
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-white/5 rounded-full border border-white/10"
          >
            {personalInfo?.phone || 'Phone Number'}
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-white/5 rounded-full border border-white/10"
          >
            {personalInfo?.location || 'Location'}
          </motion.span>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          </span>
          About
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          {personalInfo?.careerObjective || 'No career objective provided.'}
        </p>
      </motion.div>

      {/* Education Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          </span>
          Education
        </h2>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
            <div className="flex flex-col">
              <span className="text-xs uppercase text-indigo-300/70">Degree</span>
              <span className="text-lg">{education?.degree || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-indigo-300/70">Major</span>
              <span className="text-lg">{education?.major || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-indigo-300/70">Year</span>
              <span className="text-lg">{education?.year || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-indigo-300/70">CGPA</span>
              <span className="text-lg">{education?.cgpa || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-indigo-300/70">Expected Graduation</span>
              <span className="text-lg">{education?.expectedGraduation || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-indigo-300/70">Department</span>
              <span className="text-lg">{education?.department || 'N/A'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skills Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          </span>
          Skills
        </h2>
        
        {skills?.skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-indigo-300/70 mb-3">General Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.skills.map((skill, idx) => (
                <motion.span 
                  key={idx} 
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-200 text-sm font-medium border border-indigo-500/20"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        )}
        
        {skills?.programmingLanguages?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-indigo-300/70 mb-3">Programming Languages</h3>
            <div className="flex flex-wrap gap-2">
              {skills.programmingLanguages.map((lang, idx) => (
                <motion.span 
                  key={idx} 
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full bg-purple-500/10 text-purple-200 text-sm font-medium border border-purple-500/20"
                >
                  {lang}
                </motion.span>
              ))}
            </div>
          </div>
        )}
        
        {skills?.technologies?.length > 0 && (
          <div>
            <h3 className="text-sm uppercase text-indigo-300/70 mb-3">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {skills.technologies.map((tech, idx) => (
                <motion.span 
                  key={idx} 
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-200 text-sm font-medium border border-emerald-500/20"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Projects & Achievements Section (optional) */}
      {projects && projects.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            </span>
            Projects & Achievements
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -5, boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.5)' }}
                className="p-6 rounded-xl bg-white/5 border border-white/10 transition-all duration-300"
              >
                <h3 className="font-semibold text-indigo-300 text-lg mb-2">{project.name}</h3>
                <p className="text-slate-400 mb-4">{project.description}</p>
                {project.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIdx) => (
                      <span key={techIdx} className="px-3 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Certifications Section */}
      {portfolio?.certifications?.length > 0 && (
        <div className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">Certifications</h2>
          <ul className="list-disc ml-6 text-slate-200">
            {portfolio.certifications.map((cert, idx) => (
              <li key={idx} className="mb-2">
                <span className="font-semibold">{cert.name}</span>{' '}
                {cert.issuer && <span>({cert.issuer})</span>}
                {cert.date && <span>, {new Date(cert.date).toLocaleDateString()}</span>}
                {cert.link && <a href={cert.link} className="text-blue-300 underline ml-2" target="_blank" rel="noopener noreferrer">[Link]</a>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extracurricular Activities Section */}
      {portfolio?.extracurricular?.length > 0 && (
        <div className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">Extracurricular Activities</h2>
          <ul className="list-disc ml-6 text-slate-200">
            {portfolio.extracurricular.map((item, idx) => (
              <li key={idx} className="mb-2">
                {item.activity}{item.role && <> ({item.role})</>}{item.achievement && <>: {item.achievement}</>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Research Section */}
      {portfolio?.research?.length > 0 && (
        <div className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">Research</h2>
          <ul className="list-disc ml-6 text-slate-200">
            {portfolio.research.map((item, idx) => (
              <li key={idx} className="mb-2">
                <span className="font-semibold">{item.title}</span>{item.year && <> ({item.year})</>}{item.role && <>, {item.role}</>}{item.description && <>: {item.description}</>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hackathons Section */}
      {portfolio?.hackathons?.length > 0 && (
        <div className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">Hackathons</h2>
          <ul className="list-disc ml-6 text-slate-200">
            {portfolio.hackathons.map((item, idx) => (
              <li key={idx} className="mb-2">
                <span className="font-semibold">{item.name}</span>{item.year && <> ({item.year})</>}{item.achievement && <>: {item.achievement}</>}{item.description && <> - {item.description}</>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer with Download PDF */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="w-full max-w-4xl flex flex-col items-center mt-8 mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-3 px-12 py-5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 relative overflow-hidden group border border-white/10"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-xl group-hover:opacity-75 transition-opacity opacity-0"></span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="relative">Download Resume as PDF</span>
        </motion.button>
        <div className="mt-6 text-center">
          <span className="text-slate-300 text-sm block mb-1">Your professional resume is ready!</span>
          <span className="text-slate-400 text-xs">Powered by Rojgar Setu AI Portfolio</span>
        </div>
      </motion.footer>
    </div>
  );
};

export default PortfolioView;