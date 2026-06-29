// components/Analytics.js
// Analytics.jsx - Alternative approach that maintains your calculation logic

import { adminService } from '../firebase/services';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { FaChartLine, FaChartBar, FaChartPie, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaUsers, FaUserMd, FaPills } from 'react-icons/fa';
import { usePatients } from '../hooks/usePatients';
import { useTreatments } from '../hooks/useTreatments';
import AdminLayout from './AdminLayout';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    treatedPatients: 0,
    pendingPatients: 0,
    averageTreatmentTime: 0,
    patientsByPriority: { immediate: 0, urgent: 0, routine: 0 }
  });
  
  const { patients } = usePatients();
  const { treatments } = useTreatments();



useEffect(() => {
  const loadAndCalculateStats = async () => {
    try {
      // Fetch all patients from Firebase
      const allPatients = await adminService.getAllPatients();
      
      // Now use your original calculation logic on the fetched data
      const total = allPatients.length;
      const treated = allPatients.filter(p => p.status === 'treated').length;
      const pending = allPatients.filter(p => p.status !== 'treated').length;
      const avgTime = allPatients.filter(p => p.waitTime).reduce((acc, p) => acc + p.waitTime, 0) / (allPatients.filter(p => p.waitTime).length || 1);
      
      const priorityCounts = allPatients.reduce((acc, p) => {
        const priority = p.priority?.toLowerCase() || 'routine';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalPatients: total,
        treatedPatients: treated,
        pendingPatients: pending,
        averageTreatmentTime: Math.round(avgTime),
        patientsByPriority: {
          immediate: priorityCounts.immediate || 0,
          urgent: priorityCounts.urgent || 0,
          routine: priorityCounts.routine || 0
        }
      });
      
      // You can also fetch treatments for additional metrics if needed
      // const treatmentsData = await adminService.getTreatments();
      
      generateChartData();
      
    } catch (error) {
      console.error('Error loading patient data from Firebase:', error);
    }
  };

  loadAndCalculateStats();
  
  // Refresh data periodically
  const interval = setInterval(loadAndCalculateStats, 10000);
  
  return () => clearInterval(interval);
}, [timeRange]);

  const generateChartData = () => {
    const data = [];
    const now = new Date();
    
    if (timeRange === 'daily') {
      for (let i = 0; i < 24; i++) {
        data.push({
          time: `${i}:00`,
          patients: Math.floor(Math.random() * 15),
          treated: Math.floor(Math.random() * 12)
        });
      }
    } else if (timeRange === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      days.forEach(day => {
        data.push({
          name: day,
          patients: Math.floor(Math.random() * 50 + 20),
          treated: Math.floor(Math.random() * 45 + 15),
          waitTime: Math.floor(Math.random() * 30 + 5)
        });
      });
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(month => {
        data.push({
          name: month,
          patients: Math.floor(Math.random() * 200 + 50),
          treated: Math.floor(Math.random() * 180 + 40),
          waitTime: Math.floor(Math.random() * 25 + 10)
        });
      });
    }
    setChartData(data);
  };

  const priorityData = [
    { name: 'Immediate', value: stats.patientsByPriority.immediate, color: '#ef4444' },
    { name: 'Urgent', value: stats.patientsByPriority.urgent, color: '#f97316' },
    { name: 'Routine', value: stats.patientsByPriority.routine, color: '#22c55e' }
  ];

  const COLORS = ['#ef4444', '#f97316', '#22c55e'];

  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('daily')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                timeRange === 'daily' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <FaCalendarDay /> Daily
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                timeRange === 'weekly' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <FaCalendarWeek /> Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                timeRange === 'monthly' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <FaCalendarAlt /> Monthly
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
                {/* <p className="text-xs text-green-600 mt-1">+12% from last month</p> */}
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Treated Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.treatedPatients}</p>
                <p className="text-xs text-green-600 mt-1">{Math.round((stats.treatedPatients / stats.totalPatients) * 100)}% success rate</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FaPills className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Treatment</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPatients}</p>
                <p className="text-xs text-orange-600 mt-1">Awaiting diagnosis</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <FaUserMd className="text-orange-600 dark:text-orange-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Treatment Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageTreatmentTime} mins</p>
                {/* <p className="text-xs text-blue-600 mt-1">-5 mins from last week</p> */}
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Line/Area Chart */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaChartLine /> Patient Flow Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="patients" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Patients" />
                <Area type="monotone" dataKey="treated" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Treated" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution Pie Chart */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaChartPie /> Patients by Priority
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Wait Times */}
          <div className="card p-4 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaChartBar /> Average Wait Time Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="waitTime" fill="#f97316" name="Wait Time (minutes)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="patients" fill="#3b82f6" name="Patient Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Treatment Activity</h3>
          <div className="space-y-3">
            {treatments?.slice(0, 5).map((treatment, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{treatment.patientName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{treatment.diagnosis}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{treatment.treatment}</p>
                  <p className="text-xs text-gray-400">{new Date(treatment.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;