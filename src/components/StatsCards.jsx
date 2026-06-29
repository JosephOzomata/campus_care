// components/StatsCards.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaUsers, FaHospitalUser } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  const cards = [
    { label: 'Avg. Wait Time', value: `${stats.avgWaitTime} mins`, icon: FaClock, color: 'blue' },
    { label: 'Active Patients', value: stats.activePatients, icon: FaUsers, color: 'green' },
    { label: 'In-facility', value: stats.inFacility, icon: FaHospitalUser, color: 'orange' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${card.color}-100 dark:bg-${card.color}-900/30 rounded-lg flex items-center justify-center`}>
              <card.icon className={`text-${card.color}-600 dark:text-${card.color}-400 text-xl`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;