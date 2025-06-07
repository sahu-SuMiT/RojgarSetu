import { useState, useEffect } from 'react';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaPaperPlane, FaUserGraduate } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
// import axios from 'axios';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [collegeName, setCollegeName] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('collegeId');
    const name = localStorage.getItem('collegeName');
    setCollegeId(id);
    setCollegeName(name);
  }, []);

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

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // In a real application, this would be an API call
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: collegeName,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate API response
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'sent' }
            : msg
        ));
      }, 1000);
    } catch {
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COLLEGE SERVICES" />
      <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
        <div style={{ padding: '0 24px' }}>
          <SearchBar />
        </div>
        <div style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>Support Center</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 300px', 
            gap: '24px',
            height: 'calc(100vh - 200px)'
          }}>
            {/* Messages Section */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                marginBottom: '24px'
              }}>
                {messages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#6b7280',
                    padding: '48px 0'
                  }}>
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      style={{
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{
                        background: '#f3f4f6',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        maxWidth: '80%'
                      }}>
                        <div style={{ 
                          fontSize: '0.875rem',
                          color: '#4b5563',
                          marginBottom: '4px'
                        }}>
                          {message.sender}
                        </div>
                        <div style={{ color: '#1f2937' }}>
                          {message.text}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginTop: '4px'
                        }}>
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitMessage} style={{
                display: 'flex',
                gap: '12px'
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaPaperPlane />
                  Send
                </button>
              </form>
            </div>

            {/* Quick Help Section */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                marginBottom: '16px',
                color: '#1f2937'
              }}>
                Quick Help
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '12px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  How to post a job?
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  How to manage applications?
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  How to view analytics?
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  How to update student profiles?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support; 