import React, { useState } from 'react';
import { Wifi, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const MacAddressUpdate = () => {
  const [formData, setFormData] = useState({
    currentMac: '',
    newMac: '',
    confirmMac: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.currentMac) {
      newErrors.currentMac = 'Current MAC address is required';
    } else if (!validateMacAddress(formData.currentMac)) {
      newErrors.currentMac = 'Please enter a valid MAC address';
    }
    
    if (!formData.newMac) {
      newErrors.newMac = 'New MAC address is required';
    } else if (!validateMacAddress(formData.newMac)) {
      newErrors.newMac = 'Please enter a valid MAC address';
    }
    
    if (!formData.confirmMac) {
      newErrors.confirmMac = 'Please confirm your new MAC address';
    } else if (formData.newMac !== formData.confirmMac) {
      newErrors.confirmMac = 'MAC addresses do not match';
    }
    
    if (formData.currentMac === formData.newMac) {
      newErrors.newMac = 'New MAC address must be different from current one';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFormData({
        currentMac: '',
        newMac: '',
        confirmMac: ''
      });
    } catch (error) {
      setErrors({
        general: 'Failed to update MAC address. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatMacAddress = (mac: string) => {
    return mac.replace(/[^a-fA-F0-9]/g, '').match(/.{1,2}/g)?.join(':').slice(0, 17) || mac;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Update MAC Address</h1>
      </div>

      <div className="max-w-2xl">
        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Why Update Your MAC Address?</h3>
              <p className="text-sm text-blue-800 mt-1">
                If you're using a new device or your device's MAC address has changed, 
                you'll need to update it here so your attendance can be tracked properly. 
                You'll need to provide your current MAC address for security verification.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-green-900">MAC Address Updated Successfully!</h3>
                <p className="text-sm text-green-800 mt-1">
                  Your MAC address has been updated. You can now use your new device for attendance tracking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Update Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="currentMac" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  Current MAC Address
                </div>
              </label>
              <input
                id="currentMac"
                name="currentMac"
                type="text"
                value={formData.currentMac}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.currentMac ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 00:11:22:33:44:55"
                maxLength={17}
              />
              {errors.currentMac && (
                <p className="mt-1 text-sm text-red-600">{errors.currentMac}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your current device's MAC address for verification
              </p>
            </div>

            <div>
              <label htmlFor="newMac" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  New MAC Address
                </div>
              </label>
              <input
                id="newMac"
                name="newMac"
                type="text"
                value={formData.newMac}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.newMac ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 00:11:22:33:44:66"
                maxLength={17}
              />
              {errors.newMac && (
                <p className="mt-1 text-sm text-red-600">{errors.newMac}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your new device's MAC address
              </p>
            </div>

            <div>
              <label htmlFor="confirmMac" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  Confirm New MAC Address
                </div>
              </label>
              <input
                id="confirmMac"
                name="confirmMac"
                type="text"
                value={formData.confirmMac}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.confirmMac ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 00:11:22:33:44:66"
                maxLength={17}
              />
              {errors.confirmMac && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmMac}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Re-enter your new MAC address to confirm
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Important Notes:</h4>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                    <li>• Make sure your new device is connected to the network</li>
                    <li>• You can find your MAC address in your device's network settings</li>
                    <li>• This change will take effect immediately</li>
                    <li>• Your attendance history will remain unchanged</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ currentMac: '', newMac: '', confirmMac: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update MAC Address'}
              </button>
            </div>
          </form>
        </div>

        {/* How to Find MAC Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Find Your MAC Address</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Windows:</h4>
              <p className="text-sm text-gray-600">
                Open Command Prompt and type: <code className="bg-gray-100 px-2 py-1 rounded">ipconfig /all</code>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Mac:</h4>
              <p className="text-sm text-gray-600">
                System Preferences → Network → Advanced → Hardware → MAC Address
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Linux:</h4>
              <p className="text-sm text-gray-600">
                Open Terminal and type: <code className="bg-gray-100 px-2 py-1 rounded">ifconfig</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacAddressUpdate;