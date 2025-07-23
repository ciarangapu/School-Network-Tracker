import React, { useState, useEffect } from 'react';
import { Wifi, RefreshCw, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import ApiService from '../../services/api';

const LiveMacData = () => {
  const [macData, setMacData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchMacData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ApiService.getCurrentMACs();
      setMacData(data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch MAC data. Make sure the scraper is running.');
      console.error('Error fetching MAC data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSnapshot = async () => {
    setIsLoading(true);
    try {
      await ApiService.triggerSnapshot();
      await fetchMacData();
    } catch (err) {
      setError('Failed to trigger snapshot.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMacData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMacData, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Live MAC Address Data</h1>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
          </label>
          <button
            onClick={triggerSnapshot}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Take Snapshot</span>
          </button>
          <button
            onClick={fetchMacData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Devices</p>
              <p className="text-2xl font-bold text-blue-600">
                {macData?.count || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Wifi className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Update</p>
              <p className="text-lg font-semibold text-gray-900">
                {lastUpdate || 'Never'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scraper Status</p>
              <p className={`text-lg font-semibold ${error ? 'text-red-600' : 'text-green-600'}`}>
                {error ? 'Error' : 'Running'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${error ? 'bg-red-100' : 'bg-green-100'}`}>
              {error ? (
                <AlertCircle className="h-6 w-6 text-red-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Connection Error</h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* MAC Addresses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Currently Connected MAC Addresses
            </h3>
            <span className="text-sm text-gray-500">
              {macData?.timestamp && `Last scraped: ${new Date(macData.timestamp).toLocaleString()}`}
            </span>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading MAC addresses...</span>
            </div>
          ) : macData?.macAddresses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {macData.macAddresses.map((mac: string, index: number) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Wifi className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-mono font-medium text-gray-900">
                        {mac}
                      </p>
                      <p className="text-xs text-gray-500">Device {index + 1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No MAC addresses found</p>
              <p className="text-sm text-gray-500 mt-1">
                Make sure the scraper is running and devices are connected
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">How it Works</h4>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• This interface shows live MAC addresses from your router</li>
              <li>• Click "Refresh" to manually fetch the latest data</li>
              <li>• Enable "Auto-refresh" for real-time monitoring</li>
              <li>• "Take Snapshot" creates an attendance record for all connected devices</li>
              <li>• Make sure your backend server is running for live data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMacData;