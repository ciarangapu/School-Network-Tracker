import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import ApiService from '../../services/api';

const Overview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    currentPresent: 0,
    currentAbsent: 0,
    lastUpdate: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, snapshotsData] = await Promise.all([
        ApiService.getAttendanceSummary(),
        ApiService.getAttendanceSnapshots({ limit: 5 })
      ]);
      
      setStats(summaryData);
      
      // Convert snapshots to activity format
      const activities = snapshotsData.map((snapshot, index) => ({
        time: new Date(snapshot.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        event: `Attendance snapshot: ${snapshot.totalPresent} present, ${snapshot.totalAbsent} absent`,
        type: 'system'
      }));
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardStats = [
    {
      name: 'Total Students',
      value: stats.totalStudents.toString(),
      change: 'Active students',
      changeType: 'neutral',
      icon: Users
    },
    {
      name: 'Present Now',
      value: stats.currentPresent.toString(),
      change: 'Currently present',
      changeType: 'increase',
      icon: UserCheck
    },
    {
      name: 'Absent Now',
      value: stats.currentAbsent.toString(),
      change: 'Currently absent',
      changeType: 'neutral',
      icon: Clock
    },
    {
      name: 'Total Snapshots',
      value: stats.totalSnapshots?.toString() || '0',
      change: 'Recorded today',
      changeType: 'neutral',
      icon: TrendingUp
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Today, {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          activity.type === 'checkin' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {activity.type === 'checkin' ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">{activity.event}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <time>{activity.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )) : (
                  <li className="text-center py-8 text-gray-500">
                    No recent activity found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Attendance Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Low Attendance Warning</p>
                  <p className="text-sm text-gray-600">3 students have attendance below 75%</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Consecutive Absences</p>
                  <p className="text-sm text-gray-600">John Smith absent for 3 consecutive days</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Snapshot Reminder</p>
                  <p className="text-sm text-gray-600">Next attendance snapshot in 15 minutes</p>
                  <p className="text-xs text-gray-500 mt-1">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;