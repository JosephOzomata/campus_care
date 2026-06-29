// hooks/useQueue.js (REPLACE with this)
import { useState, useEffect } from 'react';
import { adminService } from '../firebase/services';

export const useQueue = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      const data = await adminService.getQueue();
      setQueue(data);
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  };

  const updateQueue = async (patientId, action) => {
    if (action === 'next') {
      // Implementation to move patient to active/treatment
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, { status: 'active' });
      await loadQueue();
    }
  };

  return { queue, updateQueue };
};