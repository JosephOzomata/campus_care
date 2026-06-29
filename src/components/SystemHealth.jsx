// components/SystemHealth.js
import React from 'react';
import { FaCheckCircle, FaServer, FaDatabase, FaClock } from 'react-icons/fa';

const SystemHealth = () => {
  return (
    <div className="card">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">System Health Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                System latency is within normal parameters. Daily backups connected successfully at 04:00 AM.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FaClock size={12} />
            <span>Last check: 2 mins ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;