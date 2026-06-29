// components/RosterStatus.js
import React from 'react';
import { FaCalendarAlt, FaUserMd, FaHospitalUser } from 'react-icons/fa';

const RosterStatus = ({ staff }) => {
  const departments = [
    { name: 'Psychology - Unit 4', hours: '08:00 AM - 04:00 PM', active: '4/5', status: 'active' },
    { name: 'General Practice', hours: '07:00 AM - 07:00 PM', active: '12/12', status: 'active' },
    { name: 'Emergency Triage', hours: '24 Hours', active: '8/8', status: 'active' },
    { name: 'Dental Clinic', hours: '09:00 AM - 05:00 PM', active: '0/5', status: 'closed' }
  ];

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roster Status</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Full Schedule Overview</p>
      </div>
      <div className="p-4 space-y-4">
        {departments.map((dept, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{dept.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{dept.hours}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${
                dept.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {dept.active}
              </p>
              <p className="text-xs text-gray-400">{dept.status === 'active' ? 'Active' : 'Closed'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RosterStatus;