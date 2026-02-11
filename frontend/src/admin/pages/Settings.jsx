import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiLock,
  FiBell,
  FiSave,
  FiRefreshCw,
  FiShield
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import adminApi from '../services/adminApi';

const Settings = () => {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    name: 'Super Admin',
    email: 'admin@resumecraft.com',
    notifications: true,
    darkMode: false,
    twoFactorAuth: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    if (
      settings.newPassword &&
            settings.newPassword !== settings.confirmPassword
    ) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // Example API call (create backend later if needed)
      // await adminApi.updateSettings(settings);

      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage admin preferences & security</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiUser /> Profile Settings
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={settings.name}
            onChange={handleChange}
            placeholder="Admin Name"
            className="input"
          />
          <input
            name="email"
            value={settings.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="input"
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiShield /> Security
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            onChange={handleChange}
            className="input"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            onChange={handleChange}
            className="input"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            onChange={handleChange}
            className="input"
          />
        </div>

        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            name="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onChange={handleChange}
          />
                    Enable Two-Factor Authentication
        </label>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiBell /> Notifications
        </h3>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
          />
                    Receive system notifications via email
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-3 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <FiSave />
                    Save Changes
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-3 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
        >
          <FiRefreshCw />
                    Reset
        </button>
      </div>
    </div>
  );
};

export default Settings;
