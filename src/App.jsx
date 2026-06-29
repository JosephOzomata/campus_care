// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './components/AdminDashboard';
import PatientDirectory from './components/PatientDirectory';
import StaffRoster from './components/StaffRoster';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/patient-directory" element={<PatientDirectory />} />
        <Route path="/staff-roster" element={<StaffRoster />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App; // THIS IS CRITICAL