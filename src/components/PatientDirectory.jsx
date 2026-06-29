// PatientDirectory.jsx - Complete Updated File
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaUser, FaStethoscope, FaNotesMedical, 
  FaPills, FaCalendarAlt, FaSave, FaEdit, FaCheckCircle,
  FaExclamationTriangle, FaUserMd, FaArrowLeft, FaPlus,
  FaIdCard, FaClock, FaHospitalUser, FaClipboardList
} from 'react-icons/fa';
import { doc, updateDoc, getDoc, getDocs, collection, query, where, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { usePatients } from '../hooks/usePatients';
import { useTreatments } from '../hooks/useTreatments';
import AdminLayout from './AdminLayout';

const PatientDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patient');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const { patients, loading: patientsLoading, addPatient, updatePatient } = usePatients();
  const { addTreatment, getPatientTreatments } = useTreatments();
  const navigate = useNavigate();

  useEffect(() => {
    if (patientIdParam) {
      const patient = patients.find(p => p.id === patientIdParam || p.id === `#${patientIdParam}` || p.id === patientIdParam.replace('#', ''));
      if (patient) {
        setSelectedPatient(patient);
        loadTreatmentHistory(patient.id);
      }
    }
  }, [patientIdParam, patients]);

  const loadTreatmentHistory = async (patientId) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      const docSnap = await getDoc(patientRef);
      if (docSnap.exists()) {
        const patientData = docSnap.data();
        const history = patientData.medicalHistory || [];
        setTreatmentHistory(history);
      }
    } catch (error) {
      console.error('Error loading treatment history:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const patientsRef = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsRef);
      const patientsList = [];
      querySnapshot.forEach((doc) => {
        patientsList.push({ id: doc.id, ...doc.data() });
      });
      // Update your patients state here if needed
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const getCurrentIllnessRecord = () => {
    if (selectedPatient?.currentIllness) {
      return selectedPatient.currentIllness;
    }
    
    const pendingRecord = treatmentHistory.find(record => record.status === 'pending');
    if (pendingRecord) {
      return pendingRecord;
    }
    
    return {
      id: Date.now().toString(),
      symptoms: selectedPatient?.symptoms || [],
      description: selectedPatient?.description || 'No description provided',
      priority: selectedPatient?.priority || 'routine',
      registeredAt: Timestamp.now()
    };
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmitTreatment = async () => {
    if (!selectedPatient || !diagnosis) {
      showNotification('Please enter a diagnosis', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const patientRef = doc(db, 'patients', selectedPatient.id);
      const currentIllnessRecord = getCurrentIllnessRecord();
      
      await updateDoc(patientRef, {
        status: 'treated',
        currentIllness: null,
        lastDiagnosis: diagnosis,
        lastTreatment: treatment,
        treatedAt: Timestamp.now(),
        treatedBy: 'Dr. Admin',
        medicalHistory: arrayUnion({
          id: currentIllnessRecord.id || Date.now().toString(),
          symptoms: currentIllnessRecord.symptoms || selectedPatient.symptoms || [],
          description: currentIllnessRecord.description || '',
          priority: currentIllnessRecord.priority || selectedPatient.priority || 'routine',
          diagnosis: diagnosis,
          treatment: treatment,
          prescriptions: prescriptions,
          treatedBy: 'Dr. Admin',
          treatedAt: Timestamp.now(),
          status: 'treated'
        })
      });
      
      const queueQuery = query(
        collection(db, 'queue'),
        where('patientId', '==', selectedPatient.id),
        where('status', '==', 'waiting')
      );
      const queueSnapshot = await getDocs(queueQuery);
      queueSnapshot.forEach(async (queueDoc) => {
        const queueRef = doc(db, 'queue', queueDoc.id);
        await updateDoc(queueRef, {
          status: 'treated',
          treatedAt: Timestamp.now()
        });
      });
      
      showNotification('Patient treated successfully!', 'success');
      
      await loadPatients();
      await loadTreatmentHistory(selectedPatient.id);
      
      setShowTreatmentForm(false);
      setDiagnosis('');
      setTreatment('');
      setPrescriptions([]);
      
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error saving treatment: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const foundPatient = patients.find(p => 
      p.name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
      p.id?.toLowerCase().includes(e.target.value.toLowerCase())
    );
    if (foundPatient && e.target.value.length > 2) {
      setSelectedPatient(foundPatient);
      loadTreatmentHistory(foundPatient.id);
    }
  };

  const handleNewPatient = () => {
    const newPatient = {
      id: `#${Math.floor(Math.random() * 9000 + 1000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      name: 'New Patient',
      priority: 'routine',
      waitTime: 0,
      status: 'waiting',
      symptoms: [],
      registeredAt: new Date().toISOString()
    };
    addPatient(newPatient);
    setSelectedPatient(newPatient);
  };

  return (
    <AdminLayout title="Patient Directory">
      <div className="space-y-6">
        {notification && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1 relative bg-white/10 backdrop-blur-xl">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or unique ID (e.g., #0492-B)..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleNewPatient}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> New Entry
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 rounded-xl backdrop-blur-xl sticky top-20 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Patients</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{filteredPatients.length} records found</p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {filteredPatients.map((patient) => (
                <motion.div
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    loadTreatmentHistory(patient.id);
                  }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {patient.id}</p>
                      {patient.symptoms && patient.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {patient.symptoms.slice(0, 2).map((symptom, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      patient.status === 'treated' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      patient.status === 'active' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {patient.status || 'waiting'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedPatient ? (
                <motion.div
                  key="patient-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-800/50 rounded-xl backdrop-blur-xl"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.name}</h2>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <FaIdCard className="inline mr-1" size={12} /> ID: {selectedPatient.id}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <FaClock className="inline mr-1" size={12} /> Wait Time: {selectedPatient.waitTime || 0} mins
                          </p>
                        </div>
                      </div>
                      {!showTreatmentForm && selectedPatient.status !== 'treated' && (
                        <button
                          onClick={() => setShowTreatmentForm(true)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <FaStethoscope /> Start Treatment
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FaClipboardList /> Symptoms & Initial Assessment
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        {selectedPatient.symptoms && selectedPatient.symptoms.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.symptoms.map((symptom, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm shadow-sm">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No symptoms recorded yet. Please assess the patient.</p>
                        )}
                      </div>
                    </div>

                    {showTreatmentForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <FaUserMd /> Diagnosis & Treatment
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Diagnosis
                            </label>
                            <textarea
                              value={diagnosis}
                              onChange={(e) => setDiagnosis(e.target.value)}
                              rows="2"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter diagnosis..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Treatment Plan
                            </label>
                            <textarea
                              value={treatment}
                              onChange={(e) => setTreatment(e.target.value)}
                              rows="3"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter treatment plan..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Prescriptions
                            </label>
                            <input
                              type="text"
                              placeholder="Add prescription (press Enter)"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value) {
                                  setPrescriptions([...prescriptions, e.target.value]);
                                  e.target.value = '';
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              {prescriptions.map((pres, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-1">
                                  {pres}
                                  <button
                                    onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                                    className="hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={handleSubmitTreatment} disabled={loading} className="btn-primary flex items-center gap-2">
                              <FaSave /> {loading ? 'Saving...' : 'Save Treatment'}
                            </button>
                            <button onClick={() => setShowTreatmentForm(false)} className="btn-secondary">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FaPills /> Treatment History
                      </h3>
                      {treatmentHistory.length > 0 ? (
                        <div className="space-y-3">
                          {treatmentHistory.map((record) => (
                            <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{record.diagnosis || 'Pending Diagnosis'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {record.registeredAt?.toDate ? new Date(record.registeredAt.toDate()).toLocaleDateString() : new Date(record.registeredAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {record.status === 'treated' && <FaCheckCircle className="text-green-500" />}
                              </div>
                              {record.symptoms && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {record.symptoms.map((symptom, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{record.description}</p>
                              {record.diagnosis && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Diagnosis: {record.diagnosis}</p>
                                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Treatment: {record.treatment}</p>
                                  {record.prescriptions && record.prescriptions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {record.prescriptions.map((pres, idx) => (
                                        <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded-full">
                                          {pres}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                          No treatment records found. Start treatment to document patient care.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-patient"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-800/50 rounded-xl backdrop-blur-xl p-12 text-center"
                >
                  <FaUser className="text-gray-300 dark:text-gray-600 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Patient Selected</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Search for a patient or select one from the list to view their medical records and start treatment.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PatientDirectory;