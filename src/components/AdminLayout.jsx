// components/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaUserMd, FaChartLine, FaCog, FaSignOutAlt, FaSearch, FaSun, FaMoon, FaChevronRight, FaStethoscope } from 'react-icons/fa';
import { useDarkMode } from '../hooks/useDarkMode';
import backimg from '../images/vuna.jpeg'

const AdminLayout = ({ children, title }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaUsers, path: '/admin' },
    { id: 'patient-directory', label: 'Patient Directory', icon: FaUsers, path: '/patient-directory' },
    { id: 'staff-roster', label: 'Staff Roster', icon: FaUserMd, path: '/staff-roster' },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine, path: '/analytics' },
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/login');
  };

  return (
    <div style={{backgroundImage: `url(${backimg})`}} className="flex h-screen bg-cover bg-center  dark:bg-gray-900 bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.4))">
      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full bg-gray-900 dark:bg-gray-900 border-r border-gray-700 
        flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 z-50 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
        >
          <FaChevronRight className={`text-white text-xs transition-transform duration-300 ${!isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Logo Section */}
        <div className={`p-4 border-3 rounded-3xl m-2 bg-white/10 shadow-xl transition-all duration-300 ${isSidebarCollapsed ? 'mx-2 px-2' : ''}`}>
          <div className="flex items-center justify-between">
            <div className={`overflow-hidden transition-all ${isSidebarCollapsed ? 'w-10' : 'w-auto'}`}>
              {!isSidebarCollapsed ? (
                <>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                    CampusCare
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">Admin Portal</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">University Health Services</p>
                </>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                  <FaStethoscope className="text-white text-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
                ${isSidebarCollapsed ? 'justify-center' : ''}
              `}
              title={isSidebarCollapsed ? item.label : ""}
            >
              <item.icon size={20} />
              {!isSidebarCollapsed && (
                <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>


        <div className={`p-2 mb-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              text-red-400 hover:text-red-300 hover:bg-red-500/10
              ${isSidebarCollapsed ? 'justify-center' : ''}
            `}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            
            {!isSidebarCollapsed && (
              <span className="font-medium text-sm whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 overflow-y-auto transition-all duration-300
        ${isSidebarCollapsed ? 'md:ml-0 ml-20' : 'md:ml-0 ml-64'}
      `}>
        <div className="p-4 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">University Health Services Management System</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;