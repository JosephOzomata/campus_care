// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaUserMd, FaChartLine, FaCog, FaSearch, 
  FaChevronRight, FaClock, FaHospitalUser, FaCalendarAlt,
  FaTachometerAlt, FaArrowRight, FaStethoscope, FaClipboardList,
  FaSun, FaMoon, FaSignOutAlt, FaBars
} from 'react-icons/fa';
import { usePatients } from '../hooks/usePatients';
import { useStaff } from '../hooks/useStaff';
import { useQueue } from '../hooks/useQueue';
import { useDarkMode } from '../hooks/useDarkMode';
import LiveQueue from './LiveQueue';
import StatsCards from './StatsCards';
import RosterStatus from './RosterStatus';
import SystemHealth from './SystemHealth';
import backimg from '../images/vuna.jpeg'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { patients, loading: patientsLoading } = usePatients();
  const { staff } = useStaff();
  const { queue, updateQueue } = useQueue();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

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
    { id: 'patient-directory', label: 'Patient Directory', icon: FaUsers, path: '/patient-directory' },
    // { id: 'staff-roster', label: 'Staff Roster', icon: FaUserMd, path: '/staff-roster' },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine, path: '/analytics' },
  ];

  const stats = {
    avgWaitTime: queue.length ? Math.round(queue.reduce((acc, p) => acc + p.waitTime, 0) / queue.length) : 0,
    activePatients: patients.filter(p => p.status === 'active').length,
    inFacility: patients.filter(p => p.status === 'in-facility').length,
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patient-directory?patient=${patientId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/login');
  };

  return (
    <div style={{backgroundImage: `url(${backimg})`}} className="flex h-screen bg-cover bg-center bg-gray-50 dark:bg-gray-900">
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
                ${location.pathname === item.path 
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

        {/* System Status */}
        <div className="p-2 mb-2">
          <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 transition-all ${isSidebarCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FaStethoscope className="text-white" size={12} />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">System Status</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">All systems operational</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
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
            <FaSignOutAlt size={18} />
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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time queue management and analytics</p>
            </div>
            <div className="relative">
              {/* Search input if needed */}
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Live Queue and Roster Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-3">
              <LiveQueue queue={queue} onPatientClick={handlePatientClick} updateQueue={updateQueue} />
            </div>
            {/* <div>
              <RosterStatus staff={staff} />
            </div> */}
          </div>

          {/* System Health */}
          <div className="mt-6">
            <SystemHealth />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;