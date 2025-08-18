import React, { useState, useEffect } from 'react';

interface SystemStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalAttendanceRecords: number;
  lastSnapshotTime: string | null;
  todayPresent: number;
  todayAbsent: number;
}

const DataManagement: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/system-stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAttendance = async (period: string) => {
    const confirmMessage = `Are you sure you want to reset attendance data for ${period}? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setResetLoading(`attendance-${period}`);
    try {
      const response = await fetch('/api/admin/reset-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period,
          confirmReset: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully reset attendance data for ${period}`);
        fetchSystemStats(); // Refresh stats
      } else {
        alert(`Failed to reset data: ${data.message}`);
      }
    } catch (error) {
      console.error('Error resetting attendance data:', error);
      alert('Error resetting attendance data');
    } finally {
      setResetLoading(null);
    }
  };

  const handleResetAllStudents = async () => {
    const confirmMessage = 'Are you sure you want to reset ALL student and attendance data? This will delete everything and cannot be undone.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const secondConfirm = window.confirm('This is a permanent action. Are you absolutely sure?');
    if (!secondConfirm) {
      return;
    }

    setResetLoading('all-students');
    try {
      const response = await fetch('/api/admin/reset-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmReset: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Successfully reset all student and attendance data');
        fetchSystemStats(); // Refresh stats
      } else {
        alert(`Failed to reset data: ${data.message}`);
      }
    } catch (error) {
      console.error('Error resetting student data:', error);
      alert('Error resetting student data');
    } finally {
      setResetLoading(null);
    }
  };

  const handleSendWeeklyReports = async () => {
    setEmailLoading('weekly');
    try {
      const response = await fetch('/api/admin/send-weekly-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Weekly reports sent successfully to all students!');
      } else {
        alert(`Failed to send reports: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending weekly reports:', error);
      alert('Error sending weekly reports');
    } finally {
      setEmailLoading(null);
    }
  };

  const handleSendMonthlyReports = async () => {
    setEmailLoading('monthly');
    try {
      const response = await fetch('/api/admin/send-monthly-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Monthly reports sent successfully to all students!');
      } else {
        alert(`Failed to send reports: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending monthly reports:', error);
      alert('Error sending monthly reports');
    } finally {
      setEmailLoading(null);
    }
  };

  const handleTestShiftNotification = async () => {
    if (!testEmail) {
      alert('Please enter an email address');
      return;
    }

    setEmailLoading('test');
    try {
      const response = await fetch('/api/admin/test-shift-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: testEmail,
          isPresent: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Test notification sent successfully!');
        setTestEmail('');
      } else {
        alert(`Failed to send test: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Error sending test notification');
    } finally {
      setEmailLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Data Management</h2>
        
        {/* System Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">System Statistics</h3>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.activeStudents}</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.totalAttendanceRecords}</div>
                <div className="text-sm text-gray-600">Attendance Records</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.todayPresent}</div>
                <div className="text-sm text-gray-600">Present Today</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">{loading ? 'Loading statistics...' : 'No data available'}</div>
          )}
          
          {stats?.lastSnapshotTime && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>Last Snapshot:</strong> {formatDate(stats.lastSnapshotTime)}
            </div>
          )}
        </div>

        {/* Email Management */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">Email Management</h3>
          
          {/* Automatic Email Reports */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">📧 Send Reports Manually</h4>
            <p className="text-sm text-gray-600 mb-4">
              Send weekly or monthly attendance summaries to all active students. 
              (Automatic emails are sent every Sunday for weekly and 1st of month for monthly)
            </p>
            <div className="space-y-3">
              <button
                onClick={handleSendWeeklyReports}
                disabled={emailLoading === 'weekly'}
                className="mr-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {emailLoading === 'weekly' ? 'Sending...' : 'Send Weekly Reports'}
              </button>
              <button
                onClick={handleSendMonthlyReports}
                disabled={emailLoading === 'monthly'}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {emailLoading === 'monthly' ? 'Sending...' : 'Send Monthly Reports'}
              </button>
            </div>
          </div>

          {/* Test Email Notifications */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">🧪 Test Email Notifications</h4>
            <p className="text-sm text-gray-600 mb-4">
              Test the shift attendance notification system by sending a sample email.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address to test"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTestShiftNotification}
                disabled={emailLoading === 'test' || !testEmail}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {emailLoading === 'test' ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>

          {/* Email Info */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium text-blue-800 mb-3">ℹ️ Automatic Email Schedule</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>Shift Notifications:</strong> Sent automatically after each attendance snapshot</li>
              <li><strong>Weekly Summaries:</strong> Sent every Sunday at 6:00 PM</li>
              <li><strong>Monthly Summaries:</strong> Sent on the 1st of each month at 9:00 AM</li>
              <li><strong>Email Configuration:</strong> Set up in Email Settings page</li>
            </ul>
          </div>
        </div>

        {/* Data Reset Controls */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">Data Reset Controls</h3>
          
          {/* Attendance Data Reset */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Reset Attendance Data</h4>
            <p className="text-sm text-gray-600 mb-4">
              Remove attendance snapshots for specific time periods. This will affect attendance reports and calculations.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleResetAttendance('week')}
                disabled={resetLoading === 'attendance-week'}
                className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {resetLoading === 'attendance-week' ? 'Resetting...' : 'Reset Last Week'}
              </button>
              <button
                onClick={() => handleResetAttendance('month')}
                disabled={resetLoading === 'attendance-month'}
                className="mr-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {resetLoading === 'attendance-month' ? 'Resetting...' : 'Reset Last Month'}
              </button>
              <button
                onClick={() => handleResetAttendance('all')}
                disabled={resetLoading === 'attendance-all'}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {resetLoading === 'attendance-all' ? 'Resetting...' : 'Reset All Attendance'}
              </button>
            </div>
          </div>

          {/* Complete System Reset */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h4 className="font-medium text-red-800 mb-3">⚠️ Danger Zone</h4>
            <p className="text-sm text-red-700 mb-4">
              This will permanently delete ALL student data and attendance records. This action cannot be undone.
            </p>
            <button
              onClick={handleResetAllStudents}
              disabled={resetLoading === 'all-students'}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {resetLoading === 'all-students' ? 'Resetting...' : 'Reset All Data'}
            </button>
          </div>
        </div>

        {/* Refresh Stats Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={fetchSystemStats}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Statistics'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
