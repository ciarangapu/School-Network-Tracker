import React, { useState, useEffect } from 'react';
import { Mail, Save, TestTube, CheckCircle, XCircle } from 'lucide-react';
import ApiService from '../../services/api';

const EmailSettings: React.FC = () => {
  const [emailConfig, setEmailConfig] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    password: '',
    from: 'noreply@schooltracker.com'
  });
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      const response = await ApiService.getSettings();
      if (response.success && response.settings.emailConfig) {
        setEmailConfig(response.settings.emailConfig);
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await ApiService.updateSettings({ emailConfig });
      setSaveResult({ 
        success: response.success, 
        message: response.success ? 'Email settings saved successfully!' : 'Failed to save settings'
      });
      setTimeout(() => setSaveResult(null), 3000);
    } catch (error) {
      setSaveResult({ success: false, message: 'Failed to save email settings' });
      setTimeout(() => setSaveResult(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      setTestResult({ success: false, message: 'Please enter a test email address' });
      setTimeout(() => setTestResult(null), 3000);
      return;
    }

    try {
      setIsTesting(true);
      const response = await ApiService.testEmailConfig(emailConfig, testEmail);
      setTestResult({ 
        success: response.success, 
        message: response.success ? 'Test email sent successfully!' : response.message
      });
      setTimeout(() => setTestResult(null), 5000);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Failed to send test email' });
      setTimeout(() => setTestResult(null), 5000);
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setEmailConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading email settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
        <Mail className="h-8 w-8 text-blue-600" />
      </div>

      {/* Results Messages */}
      {saveResult && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          saveResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {saveResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{saveResult.message}</span>
        </div>
      )}

      {testResult && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {testResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* SMTP Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SMTP Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              value={emailConfig.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              type="number"
              value={emailConfig.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="587"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Username
            </label>
            <input
              type="email"
              value={emailConfig.user}
              onChange={(e) => handleInputChange('user', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Password / App Password
            </label>
            <input
              type="password"
              value={emailConfig.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email Address
            </label>
            <input
              type="email"
              value={emailConfig.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="noreply@schooltracker.com"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="secure"
              checked={emailConfig.secure}
              onChange={(e) => handleInputChange('secure', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="secure" className="ml-2 block text-sm text-gray-900">
              Use SSL/TLS (for port 465)
            </label>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Email Configuration</h2>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleTestEmail}
              disabled={isTesting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <TestTube className="h-4 w-4" />
              <span>{isTesting ? 'Testing...' : 'Send Test'}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Gmail Setup Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Enable 2-factor authentication on your Gmail account</li>
            <li>2. Generate an App Password (not your regular password)</li>
            <li>3. Use your Gmail address as username and App Password as password</li>
            <li>4. Keep port as 587 and SSL/TLS unchecked for Gmail</li>
          </ul>
        </div>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default EmailSettings;
