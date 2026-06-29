// hooks/useStaff.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'campuscare_staff';

const generateSampleStaff = () => [
  { id: '#1001', name: 'Dr. Sarah Chen', role: 'Head of Department', department: 'Emergency Triage', duty: 'Triage A', shift: '08:00 AM - 04:00 PM', status: 'active', startDate: '2023-01-15' },
  { id: '#1002', name: 'Nurse James Wilson', role: 'Senior Nurse', department: 'General Practice', duty: 'Specialist 2', shift: '07:00 AM - 07:00 PM', status: 'active', startDate: '2023-03-20' },
  { id: '#1003', name: 'Dr. Emily Rodriguez', role: 'Psychiatrist', department: 'Psychology - Unit 4', duty: 'Unit Lead', shift: '09:00 AM - 05:00 PM', status: 'active', startDate: '2023-06-10' },
  { id: '#1004', name: 'Dr. Michael Lee', role: 'Dentist', department: 'Dental Clinic', duty: 'Oral Surgery', shift: '09:00 AM - 05:00 PM', status: 'off', startDate: '2023-02-01', endDate: '2023-12-20' }
];

export const useStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStaff(JSON.parse(stored));
    } else {
      setStaff(generateSampleStaff());
    }
    setLoading(false);
  }, []);

  const addStaffMember = (member) => {
    const newStaff = [...staff, member];
    setStaff(newStaff);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStaff));
  };

  const updateStaffMember = (id, updates) => {
    const newStaff = staff.map(m => m.id === id ? { ...m, ...updates } : m);
    setStaff(newStaff);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStaff));
  };

  const deleteStaffMember = (id) => {
    const newStaff = staff.filter(m => m.id !== id);
    setStaff(newStaff);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStaff));
  };

  return { staff, loading, addStaffMember, updateStaffMember, deleteStaffMember };
};