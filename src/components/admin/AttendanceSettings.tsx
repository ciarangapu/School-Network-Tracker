import React, { useState } from 'react';
import { Clock, Settings, Save, RefreshCw } from 'lucide-react';

const AttendanceSettings = () => {
  const [settings, setSettings] = useState({
    snapshotInterval: 15,
    attendanceThreshold: 60,
    lateThreshold: 15,
    autoSnapshot: true,
    emailNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    graceTime: 5,
    minPresenceTime: 30
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Snapshot Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Snapshot Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Snapshot Interval (minutes)
              </label>
              <input
                type="number"
                name="snapshotInterval"
                value={settings.snapshotInterval}
                onChange={handleInputChange}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                How often to take attendance snapshots (1-60 minutes)
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="autoSnapshot"
                  checked={settings.autoSnapshot}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable automatic snapshots</span>
              </label>
            </div>
          </div>
        </div>

        {/* Attendance Rules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Attendance Rules</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Threshold (%)
              </label>
              <input
                type="number"
                name="attendanceThreshold"
                value={settings.attendanceThreshold}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum presence percentage to be marked as present
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Threshold (minutes)
              </label>
              <input
                type="number"
                name="lateThreshold"
                value={settings.lateThreshold}
                onChange={handleInputChange}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minutes after start time to be considered late
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grace Time (minutes)
              </label>
              <input
                type="number"
                name="graceTime"
                value={settings.graceTime}
                onChange={handleInputChange}
                min="0"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Grace period before marking late
              </p>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="workingHours.start"
                  value={settings.workingHours.start}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="workingHours.end"
                  value={settings.workingHours.end}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Presence Time (minutes)
              </label>
              <input
                type="number"
                name="minPresenceTime"
                value={settings.minPresenceTime}
                onChange={handleInputChange}
                min="1"
                max="480"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum time needed to be considered present
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Send email alerts for attendance issues
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="weeklyReports"
                  checked={settings.weeklyReports}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Weekly reports</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Generate and send weekly attendance reports
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="monthlyReports"
                  checked={settings.monthlyReports}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Monthly reports</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Generate and send monthly attendance reports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Current Settings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Snapshot Interval:</span>
            <span className="text-blue-700 ml-2">{settings.snapshotInterval} minutes</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Attendance Threshold:</span>
            <span className="text-blue-700 ml-2">{settings.attendanceThreshold}%</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Late Threshold:</span>
            <span className="text-blue-700 ml-2">{settings.lateThreshold} minutes</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Working Hours:</span>
            <span className="text-blue-700 ml-2">{settings.workingHours.start} - {settings.workingHours.end}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Grace Time:</span>
            <span className="text-blue-700 ml-2">{settings.graceTime} minutes</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Min Presence:</span>
            <span className="text-blue-700 ml-2">{settings.minPresenceTime} minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSettings;