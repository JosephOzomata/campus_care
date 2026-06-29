// components/Settings.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSun, FaMoon, FaBell, FaLock, FaGlobe, FaUserCircle, 
  FaDatabase, FaCloudUploadAlt, FaSave, FaUndo, FaExclamationTriangle,
  FaLanguage, FaPalette, FaKey, FaEnvelope, FaMobileAlt
} from 'react-icons/fa';
import { useDarkMode } from '../hooks/useDarkMode';
import AdminLayout from './AdminLayout';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    language: 'en',
    autoBackup: true,
    backupTime: '04:00',
    twoFactorAuth: false,
    sessionTimeout: '30',
    compactView: false,
    highContrast: false
  });
  const [saveStatus, setSaveStatus] = useState(null);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      localStorage.setItem('campuscare_settings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 500);
  };

  const handleReset = () => {
    const defaultSettings = {
      notifications: true,
      emailAlerts: true,
      smsAlerts: false,
      language: 'en',
      autoBackup: true,
      backupTime: '04:00',
      twoFactorAuth: false,
      sessionTimeout: '30',
      compactView: false,
      highContrast: false
    };
    setSettings(defaultSettings);
    setSaveStatus('reset');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('campuscare_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaPalette className="text-blue-500" /> Appearance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                {darkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaSun size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">High Contrast</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Increase color contrast</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('highContrast')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaGlobe size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Language</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select preferred language</p>
                </div>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaBell size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Compact View</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reduce spacing in lists</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('compactView')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.compactView ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.compactView ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaBell className="text-blue-500" /> Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaBell size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser notifications</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaEnvelope size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('emailAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaMobileAlt size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">SMS Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive SMS notifications</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('smsAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.smsAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.smsAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaLock className="text-blue-500" /> Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaKey size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaLock size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Auto logout after inactivity</p>
                </div>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaDatabase className="text-blue-500" /> Data Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaCloudUploadAlt size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Auto Backup</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schedule automatic backups</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('autoBackup')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.autoBackup && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaLock size={20} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Backup Time</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Daily backup schedule</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={settings.backupTime}
                  onChange={(e) => handleChange('backupTime', e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <FaSave />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Settings'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2"
          >
            <FaUndo />
            Reset to Default
          </motion.button>
        </div>

        {/* Save Status Message */}
        {saveStatus === 'saved' && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Settings saved successfully!
          </div>
        )}
        {saveStatus === 'reset' && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Settings reset to default!
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;