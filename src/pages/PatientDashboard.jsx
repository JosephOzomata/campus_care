// pages/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserCircle, FaStethoscope, FaHistory, FaCalendarAlt, 
  FaClipboardList, FaBell, FaSignOutAlt, FaPlus, 
  FaCheckCircle, FaClock, FaExclamationTriangle, FaShieldAlt,
  FaFileMedical, FaPrescription, FaUserMd, FaArrowRight
} from 'react-icons/fa';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { patientService } from '../firebase/services';
import {db} from '../firebase/config'

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [showInfo, setShowInfo] = useState(false)
  const [activeTab, setActiveTab] = useState('register');
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [illnessForm, setIllnessForm] = useState({
    symptoms: '',
    description: '',
    priority: 'routine',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const dropDown =()=>{
    setShowInfo(!showInfo)
  }

  // FIXED CODE - Add real-time Firebase listener
useEffect(() => {
  const session = localStorage.getItem('patientSession');
  if (!session) {
    navigate('/login');
    return;
  }
  const patientData = JSON.parse(session);
  setPatient(patientData);
  
  // Set up real-time listener for patient data
  const patientRef = doc(db, 'patients', patientData.id);
  const unsubscribe = onSnapshot(patientRef, (docSnap) => {
    if (docSnap.exists()) {
      const updatedPatient = { id: docSnap.id, ...docSnap.data() };
      setPatient(updatedPatient);
      
      // Update medical history
      const history = updatedPatient.medicalHistory || [];
      setMedicalHistory(history);
      
      // Update current status
      setCurrentStatus({
        currentIllness: updatedPatient.currentIllness || null,
        status: updatedPatient.status || 'inactive',
        priority: updatedPatient.priority || null,
        lastDiagnosis: updatedPatient.lastDiagnosis || null,
        lastTreatment: updatedPatient.lastTreatment || null
      });
      
      // Show notification if newly treated
      if (updatedPatient.status === 'treated' && updatedPatient.lastDiagnosis) {
        showNotification(`You have been diagnosed: ${updatedPatient.lastDiagnosis}`, 'success');
      }
    }
  });
  
  // Cleanup listener on unmount
  return () => unsubscribe();
}, []);

  const loadPatientData = async (patientId) => {
    try {
      const history = await patientService.getMedicalHistory(patientId);
      setMedicalHistory(history);
      
      const status = await patientService.getCurrentStatus(patientId);
      setCurrentStatus(status);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const handleRegisterIllness = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const symptomsList = illnessForm.symptoms.split(',').map(s => s.trim());
      const illnessData = {
        patientName: patient.name,
        patientId: patient.id,
        symptoms: symptomsList,
        description: illnessForm.description,
        priority: illnessForm.priority,
        additionalInfo: illnessForm.additionalInfo,
        registeredBy: patient.name
      };
      
      await patientService.registerIllness(patient.id, illnessData);
      await loadPatientData(patient.id);
      setShowRegisterForm(false);
      setIllnessForm({ symptoms: '', description: '', priority: 'routine', additionalInfo: '' });
      showNotification('Illness registered successfully! A doctor will attend to you shortly.', 'success');
    } catch (error) {
      showNotification('Failed to register illness. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('patientSession');
    navigate('/login');
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FaStethoscope className="text-white text-sm" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CampusCare
              </span>
            </div>

            <div className="flex items-center gap-4">
  <button
    onClick={dropDown}
    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm"
  >
    <FaUserCircle className="text-gray-600 dark:text-gray-300 text-xl" />
    <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">
      {patient?.name?.split(' ')[0]}
    </span>
    <FaArrowRight className={`text-gray-500 dark:text-gray-400 text-xs transition-transform duration-200 ${showInfo ? 'rotate-90' : ''}`} />
  </button>
  
  {showInfo && (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={dropDown}
      />
      <div className="absolute top-16 right-4 md:right-8 z-50 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FaUserCircle className="text-white text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {patient?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ID: {patient?.id}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-3">
          <div className="mb-3 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">Account Type</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Student Patient</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all duration-200 group"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )}
</div>
          </div>
        </div>
      </nav>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {currentStatus?.currentIllness &&
          currentStatus.status === "waiting" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <FaClock className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Your illness is being reviewed
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Priority: {currentStatus.priority} • Expected wait time:{" "}
                    {currentStatus.priority === "immediate"
                      ? "5-10"
                      : currentStatus.priority === "urgent"
                        ? "15-20"
                        : "30-45"}{" "}
                    mins
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        {currentStatus?.status === "treated" && currentStatus.lastTreatment && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className=""
          >
            {/* <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-300">
                  Treatment Completed
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Diagnosis: {currentStatus.lastTreatment.diagnosis}
                </p>
              </div>
            </div> */}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "register"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Register Illness
            {activeTab === "register" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "history"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Medical History
            {activeTab === "history" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!showRegisterForm ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <FaPlus className="text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Register a New Illness
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Report your symptoms to get medical attention.
                  </p>
                  <button
                    onClick={() => setShowRegisterForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    Start New Report
                  </button>
                </div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleRegisterIllness}
                  className="max-w-2xl mx-auto"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Report Your Symptoms
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Symptoms (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={illnessForm.symptoms}
                          onChange={(e) =>
                            setIllnessForm({
                              ...illnessForm,
                              symptoms: e.target.value,
                            })
                          }
                          placeholder="e.g., Fever, Headache, Fatigue"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={illnessForm.description}
                          onChange={(e) =>
                            setIllnessForm({
                              ...illnessForm,
                              description: e.target.value,
                            })
                          }
                          rows="4"
                          placeholder="Describe your symptoms in detail..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority Level
                        </label>
                        <select
                          value={illnessForm.priority}
                          onChange={(e) =>
                            setIllnessForm({
                              ...illnessForm,
                              priority: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="routine">Routine - Non-urgent</option>
                          <option value="urgent">
                            Urgent - Needs attention within hours
                          </option>
                          <option value="immediate">
                            Immediate - Emergency
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Additional Information
                        </label>
                        <textarea
                          value={illnessForm.additionalInfo}
                          onChange={(e) =>
                            setIllnessForm({
                              ...illnessForm,
                              additionalInfo: e.target.value,
                            })
                          }
                          rows="2"
                          placeholder="Any other relevant information (allergies, medications, etc.)"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                      >
                        {loading ? "Submitting..." : "Submit Report"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRegisterForm(false)}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {medicalHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FaHistory className="text-gray-300 dark:text-gray-600 text-6xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    No Medical History
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Your past medical records will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalHistory.map((record, index) => (
                    <div
                      key={record.id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm text-gray-500">
                            {record.registeredAt?.toDate?.()
                              ? new Date(
                                  record.registeredAt.toDate(),
                                ).toLocaleDateString()
                              : new Date(
                                  record.registeredAt,
                                ).toLocaleDateString()}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {record.symptoms?.map((symptom, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 text-white bg-teal-500 rounded-full"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            record.status === "treated"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.status === "treated"
                            ? "Treated ✓"
                            : "Pending"}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{record.description}</p>

                      {/* ✅ This will now show because we fixed the data structure */}
                      {record.status === "treated" && record.diagnosis && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FaUserMd className="text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-blue-800">
                                Diagnosis
                              </p>
                              <p className="text-sm text-blue-700">
                                {record.diagnosis}
                              </p>
                              {record.treatment && (
                                <>
                                  <p className="text-sm font-semibold text-blue-800 mt-2">
                                    Treatment Plan
                                  </p>
                                  <p className="text-sm text-blue-700">
                                    {record.treatment}
                                  </p>
                                </>
                              )}
                              {record.prescriptions &&
                                record.prescriptions.length > 0 && (
                                  <>
                                    <p className="text-sm font-semibold text-blue-800 mt-2">
                                      Prescriptions
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {record.prescriptions.map((pres, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-1 bg-blue-100 rounded-full"
                                        >
                                          {pres}
                                        </span>
                                      ))}
                                    </div>
                                  </>
                                )}
                              <p className="text-xs text-blue-600 mt-2">
                                Treated by: {record.treatedBy} on{" "}
                                {record.treatedAt?.toDate
                                  ? new Date(
                                      record.treatedAt.toDate(),
                                    ).toLocaleDateString()
                                  : new Date(
                                      record.treatedAt,
                                    ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientDashboard;