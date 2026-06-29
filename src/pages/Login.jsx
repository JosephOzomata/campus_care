// pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaUserGraduate, FaArrowRight, FaShieldAlt, FaHeartbeat, FaStethoscope } from 'react-icons/fa';
import { patientService } from '../firebase/services';
import backimg from '../images/vuna.jpeg'

const Login = () => {
  const [role, setRole] = useState(null);
  const [adminUser, setAdminUser] = useState("")
  const [adminPass, setAdminPass] = useState("")
  const [formData, setFormData] = useState({ id: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handlePatientLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const patient = await patientService.authenticatePatient(formData.id, formData.name);
      if (patient) {
        localStorage.setItem('patientSession', JSON.stringify(patient));
        navigate('/patient-dashboard');
      } else {
        setError('Invalid ID or Name. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // In production, implement proper admin auth
    const adminUsername = 'admin@campuscare.edu'
    const adminPassword = 'MedTeam'
    if(adminUsername === adminUser && adminPassword === adminPass){

      localStorage.setItem('adminSession', 'true');
      navigate('/admin');
    }else{
      setError("Invalid Username or Password")
      setAdminPass('')
      setAdminUser('')
      setLoading(false)
    }
  };

  const handleRegister = async () => {
    if (!formData.id || !formData.name) {
      setError('Please enter both ID and Name to register');
      return;
    }
    
    setLoading(true);
    try {
      const newPatient = {
        id: formData.id,
        name: formData.name,
        email: `${formData.name.toLowerCase().replace(' ', '.')}@university.edu`,
        registeredAt: new Date().toISOString()
      };
      await patientService.registerPatient(newPatient);
      const patient = await patientService.authenticatePatient(formData.id, formData.name);
      localStorage.setItem('patientSession', JSON.stringify(patient));
      navigate('/patient-dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div style={{backgroundImage: `url(${backimg})`}} className="min-h-screen  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 bg-cover bg-center bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.4))">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className=" items-center flex justify-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20  rounded-2xl  shadow-lg"
            >
              <FaHeartbeat className="text-white text-3xl animate-[flip-y_3s_linear_infinite]"/>
            </motion.div>
            <h1 className="text-5xl font-bold bg-white bg-clip-text text-transparent">
              Campus<span className="">Care</span>
            </h1>
            {/* <p className="text-gray-500 dark:text-gray-400 mt-2">University Health Services Portal</p> */}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRole('patient')}
              className="group relative hover:cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-400 opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
              <div className="relative items-center justify-center flex space-x-3 z-10">
                <div className="w-16 h-16 border-1 border-green-500 rounded-xl flex items-center justify-center ">
                  <FaUserGraduate className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Student Portal</h2>
                {/* <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Register symptoms, view medical history, and track your treatment progress
                </p> */}
                {/* <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                  Continue <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div> */}
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRole('admin')}
              className="group relative hover:cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
              <div className="relative flex justify-center items-center space-x-3 z-10">
                <div className="w-16 h-16 border-1 border-teal-600 rounded-xl flex items-center justify-center ">
                  <FaUserMd className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Portal</h2>
                {/* <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Manage patients, view analytics, update diagnoses, and oversee operations
                </p> */}
                {/* <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                  Continue <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div> */}
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{backgroundImage: `url(${backimg})`}}  className="min-h-screen   bg-cover   bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.4))  flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {/* <button
          onClick={() => setRole(null)}
          className="mb-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-2"
        >
          ← Back
        </button> */}

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
              role === 'patient' 
                ? 'bg-gradient-to-br from-green-500 to-blue-500'
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              {role === 'patient' ? (
                <FaUserGraduate className="text-white text-2xl" />
              ) : (
                <FaUserMd className="text-white text-2xl" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {role === 'patient' ? 'Student Login' : 'Admin Access'}
            </h2>
            <p className="text-white mt-1">
              {role === 'patient' 
                ? 'Enter your student ID and name to continue'
                : 'Enter admin credentials to access dashboard'}
            </p>
          </div>

          {role === 'patient' ? (
            <form onSubmit={handlePatientLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student Clinic ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g., #0492-B or 0492-B"
                    className="w-full px-4 py-3 border-b-1 border-b-white focus:outline-none text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
     className="w-full px-4 py-3 border-b-1 border-b-white focus:outline-none text-white"
                    required
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  // type="submit"
                  onClick={() => setRole(null)}
                  // disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {/* {loading ? 'Logging in...' : 'Login'} */}
                  Back to Home
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    New student? Register here
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="admin@campuscare.edu"
                    className="w-full px-4 py-3 border-b-1 border-b-white focus:outline-none text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-b-1 border-b-white focus:outline-none text-white"
                    required
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  
                  {loading ? "Loggin in..." : "Access Admin Dashboard"}
                </button>
                <button
                  // type="submit"
                  onClick={() => setRole(null)}
                  // disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {/* {loading ? 'Logging in...' : 'Login'} */}
                  Back to Home
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;