// components/StaffRoster.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaCalendarAlt, FaClock, FaStethoscope, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaRegClock } from 'react-icons/fa';
import { useStaff } from '../hooks/useStaff';
import AdminLayout from './AdminLayout';

const StaffRoster = () => {
  const { staff, loading, addStaffMember, updateStaffMember, deleteStaffMember } = useStaff();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    duty: '',
    shift: '',
    status: 'active',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async () => {
    if (editingStaff) {
      await updateStaffMember(editingStaff.id, formData);
    } else {
      await addStaffMember({
        ...formData,
        id: `#${Math.floor(Math.random() * 9000 + 1000)}`,
        avatar: `https://ui-avatars.com/api/?name=${formData.name.replace(' ', '+')}&background=3b82f6&color=fff`
      });
    }
    setShowAddModal(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      role: '',
      department: '',
      duty: '',
      shift: '', 
      status: 'active',
      startDate: '',
      endDate: ''
    });
  };

  const departments = [
    'Psychology - Unit 4',
    'General Practice',
    'Emergency Triage',
    'Dental Clinic',
    'Pediatrics',
    'Cardiology',
    'Neurology'
  ];

  const shifts = ['07:00 AM - 03:00 PM', '03:00 PM - 11:00 PM', '11:00 PM - 07:00 AM', '24 Hours'];

  return (
    <AdminLayout title="Staff Roster">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Manage healthcare staff and their schedules</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Add Staff Member
          </button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=3b82f6&color=fff`}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{member.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingStaff(member);
                        setFormData(member);
                        setShowAddModal(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteStaffMember(member.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FaStethoscope className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{member.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaRegClock className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">Duty: {member.duty}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaClock className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{member.shift}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaCalendarAlt className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {member.startDate || 'Ongoing'} - {member.endDate || 'Present'}
                  </span>
                </div>
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    <FaCheckCircle size={10} />
                    {member.status === 'active' ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Role (e.g., Doctor, Nurse)"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Duty (e.g., Triage A)"
                  value={formData.duty}
                  onChange={(e) => setFormData({...formData, duty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({...formData, shift: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Shift</option>
                  {shifts.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button onClick={handleSubmit} className="btn-primary flex-1">
                    {editingStaff ? 'Update' : 'Add'} Staff
                  </button>
                  <button onClick={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                  }} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StaffRoster;