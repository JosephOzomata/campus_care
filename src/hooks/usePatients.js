// hooks/usePatients.js (REPLACE with this)
import { useState, useEffect } from 'react';
import { adminService } from '../firebase/services';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await adminService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patient) => {
    // Handled through patient registration
    await loadPatients();
  };

  const updatePatient = async (id, updates) => {
    try {
      const patientRef = doc(db, 'patients', id);
      await updateDoc(patientRef, updates);
      await loadPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const deletePatient = async (id) => {
    // Implement as needed
    await loadPatients();
  };

  return { patients, loading, addPatient, updatePatient, deletePatient };
};