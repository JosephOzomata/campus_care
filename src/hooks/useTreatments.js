// hooks/useTreatments.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'campuscare_treatments';

export const useTreatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTreatments(JSON.parse(stored));
    } else {
      setTreatments([]);
    }
    setLoading(false);
  }, []);

  const addTreatment = (treatment) => {
    const newTreatments = [treatment, ...treatments];
    setTreatments(newTreatments);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTreatments));
  };

  const getPatientTreatments = (patientId) => {
    return treatments.filter(t => t.patientId === patientId);
  };

  const updateTreatment = (id, updates) => {
    const newTreatments = treatments.map(t => t.id === id ? { ...t, ...updates } : t);
    setTreatments(newTreatments);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTreatments));
  };

  return { treatments, loading, addTreatment, getPatientTreatments, updateTreatment };
};