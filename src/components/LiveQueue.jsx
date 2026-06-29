// components/LiveQueue.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronRight, FaUser, FaClock, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const LiveQueue = ({ queue, onPatientClick, updateQueue }) => {
  const [showFullQueue, setShowFullQueue] = useState(false);
  const displayedQueue = showFullQueue ? queue : queue.slice(0, 4);

  const getPriorityStyles = (priority) => {
    switch(priority.toLowerCase()) {
      case 'immediate': return 'priority-immediate';
      case 'urgent': return 'priority-urgent';
      default: return 'priority-routine';
    }
  };

  const handleMovePatient = (patientId, e) => {
    e.stopPropagation();
    updateQueue(patientId, 'next');
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Live Queue</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active patients waiting for treatment</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {queue.length} patients
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr className="text-left text-sm text-gray-600 dark:text-gray-300">
              <th className="px-4 py-3 font-medium">PATIENT NAME</th>
              <th className="px-4 py-3 font-medium">PRIORITY</th>
              <th className="px-4 py-3 font-medium">WAIT TIME</th>
              <th className="px-4 py-3 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayedQueue.map((patient, index) => (
              <motion.tr
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onPatientClick(patient.id)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{patient.patientName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {patient.patientId}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityStyles(patient.priority)}`}>
                    {patient.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-400" size={12} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{patient.waitTime} mins</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => handleMovePatient(patient.id, e)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                  >
                    Move <FaArrowRight size={12} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {queue.length > 4 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => setShowFullQueue(!showFullQueue)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            {showFullQueue ? 'Show Less' : `View Full Queue (${queue.length - 4} more)`}
            <FaChevronRight className={`transform transition-transform ${showFullQueue ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveQueue;