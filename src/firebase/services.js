// firebase/services.js
import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, 
  query, where, orderBy, limit, Timestamp, arrayUnion 
} from 'firebase/firestore';
import { db } from './config';

// Patient Services
export const patientService = {
  // Get patient by ID
  async getPatient(patientId) {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  // Get patient by name and ID
  async authenticatePatient(patientId, name) {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('id', '==', patientId), where('name', '==', name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const patient = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      return patient;
    }
    return null;
  },

  // Register new patient
  async registerPatient(patientData) {
    const patientId = patientData.id;
    const docRef = doc(db, 'patients', patientId);
    await setDoc(docRef, {
      ...patientData,
      createdAt: Timestamp.now(),
      status: 'active',
      medicalHistory: []
    });
    return { id: patientId, ...patientData };
  },

  // Get patient's medical history
  async getMedicalHistory(patientId) {
    const patientRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(patientRef);
    return docSnap.exists() ? docSnap.data().medicalHistory || [] : [];
  },

  // Add new illness registration
  async registerIllness(patientId, illnessData) {
    const patientRef = doc(db, 'patients', patientId);
    const newRecord = {
      id: Date.now().toString(),
      ...illnessData,
      registeredAt: Timestamp.now(),
      status: 'pending',
      diagnosis: null,
      treatment: null,
      treatedBy: null,
      treatedAt: null
    };
    
    await updateDoc(patientRef, {
      medicalHistory: arrayUnion(newRecord),
      currentIllness: newRecord,
      priority: illnessData.priority,
      status: 'waiting'
    });
    
    // Also add to queue collection for admin
    const queueRef = collection(db, 'queue');
    await addDoc(queueRef, {
      patientId: patientId,
      patientName: illnessData.patientName,
      priority: illnessData.priority,
      symptoms: illnessData.symptoms,
      registeredAt: Timestamp.now(),
      status: 'waiting'
    });
    
    return newRecord;
  },

  // Get current illness status
  async getCurrentStatus(patientId) {
    const patientRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(patientRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        currentIllness: data.currentIllness || null,
        status: data.status || 'inactive',
        priority: data.priority || null
      };
    }
    return null;
  },

  // Update patient with diagnosis (called by admin)
  async updateDiagnosis(patientId, diagnosisData) {
    const patientRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(patientRef);
    if (docSnap.exists()) {
      const patient = docSnap.data();
      const updatedHistory = patient.medicalHistory.map(record => 
        record.id === diagnosisData.recordId 
          ? { ...record, ...diagnosisData, status: 'treated' }
          : record
      );
      
      await updateDoc(patientRef, {
        medicalHistory: updatedHistory,
        currentIllness: null,
        status: 'treated',
        lastTreatment: diagnosisData
      });
      
      // Update queue
      const queueRef = collection(db, 'queue');
      const q = query(queueRef, where('patientId', '==', patientId), where('status', '==', 'waiting'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { status: 'treated', treatedAt: Timestamp.now() });
      });
    }
  }
};

// Admin Services
export const adminService = {
  // Get all pending patients
  async getPendingPatients() {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('status', '==', 'waiting'), orderBy('priority', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get all patients
  async getAllPatients() {
    const patientsRef = collection(db, 'patients');
    const querySnapshot = await getDocs(patientsRef);
    const patients = [];
    querySnapshot.forEach((doc) => {
        patients.push({id: doc.id, ...doc.data()})
    })
    return patients
  },

  // Get queue
  async getQueue() {
    const queueRef = collection(db, 'queue');
    const q = query(queueRef, where('status', '==', 'waiting'), orderBy('registeredAt', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get treated patients for analytics
  async getTreatedPatients(dateRange) {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('status', '==', 'treated'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get all staff
  async getStaff() {
    const staffRef = collection(db, 'staff');
    const querySnapshot = await getDocs(staffRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Add/Update staff
  async updateStaff(staffId, data) {
    const staffRef = doc(db, 'staff', staffId);
    await setDoc(staffRef, data, { merge: true });
  },

  // Get analytics data
  async getAnalytics() {
    const patientsRef = collection(db, 'patients');
    const allPatients = await getDocs(patientsRef);
    const patients = allPatients.docs.map(doc => doc.data());
    
    const treated = patients.filter(p => p.status === 'treated');
    const waiting = patients.filter(p => p.status === 'waiting');
    
    const priorityStats = {
      immediate: patients.filter(p => p.priority === 'immediate').length,
      urgent: patients.filter(p => p.priority === 'urgent').length,
      routine: patients.filter(p => p.priority === 'routine').length
    };
    
    return {
      total: patients.length,
      treated: treated.length,
      waiting: waiting.length,
      priorityStats,
      avgWaitTime: waiting.reduce((acc, p) => acc + (p.waitTime || 15), 0) / (waiting.length || 1)
    };
  }
};