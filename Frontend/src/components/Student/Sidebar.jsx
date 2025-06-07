import React from 'react';
import { 
  User, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  FileText,  
  X,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  // user = { initials: '', name: '', role: '' },
  onLogout, // <-- Accept onLogout as a prop from App!
  sectionLabel = 'CAMPUS SERVICES'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: FileText, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Briefcase, label: 'Jobs/Internships', path: '/jobs' },
    { icon: FileText, label: 'Applications', path: '/applications' },
    { icon: Calendar, label: 'Interview Schedule', path: '/interviews' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: Sparkles, label: 'AI Portfolio', path: '/portfolio' }
  ];

  // Fallbacks for user info, omit initials if not present
  // const initials = user?.initials
  //   ? user.initials
  //   : user?.name
  //     ? user.name[0]
  //     : '';

  // const name = user?.name || '';
  // const role = user?.role || '';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-65 bg-blue-700 text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Top Section - Header */}
        <div className="flex-shrink-0">
          {/* Campus Header */}
          <div className="px-8 pt-6 pb-4 border-b border-blue-500 flex items-center justify-between">
            <div className="w-full font-bold text-lg tracking-wide whitespace-nowrap overflow-hidden text-ellipsis leading-tight max-w-38">
              Campus Connect
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-blue-200 hover:text-white ml-2 flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Section Label */}
          <div className="text-blue-200 font-bold text-xs px-8 mt-4 mb-4 tracking-widest">
            {sectionLabel}
          </div>
        </div>
        
        {/* Middle Section - Spacer */}
        <div className="flex-1"></div>
        
        {/* Bottom Section - Navigation and Logout */}
        <div className="flex-shrink-0">
          {/* Navigation */}
          <nav className="flex flex-col gap-1.5 mb-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              const IconComponent = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`
                    flex items-center gap-3.5 py-3 px-8 text-base mb-0.5 cursor-pointer text-left w-full
                    transition-all duration-200 max-w-55 whitespace-nowrap overflow-hidden text-ellipsis
                    border-l-4 rounded-r-lg
                    ${isActive 
                      ? 'text-white font-bold border-l-white bg-blue-800' 
                      : 'text-blue-200 font-semibold border-l-transparent bg-transparent hover:bg-blue-800'
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-40">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 py-3 px-8 text-base cursor-pointer border-t border-blue-500 text-blue-200 hover:text-white hover:bg-blue-800 transition-all duration-200"
            style={{ textAlign: 'left' }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;