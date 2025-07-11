import React from 'react';
import { Users, UserCheck, Clock, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

const Overview = () => {
  const stats = [
    {
      name: 'Total Students',
      value: '124',
      change: '+12%',
      changeType: 'increase',
      icon: Users
    },
    {
      name: 'Present Today',
      value: '98',
      change: '+5%',
      changeType: 'increase',
      icon: UserCheck
    },
    {
      name: 'Attendance Rate',
      value: '89.2%',
      change: '+2.1%',
      changeType: 'increase',
      icon: TrendingUp
    },
    {
      name: 'Late Arrivals',
      value: '6',
      change: '-15%',
      changeType: 'decrease',
      icon: Clock
    }
  ];

  const recentActivity = [
    { time: '10:30 AM', event: 'John Doe marked present', type: 'checkin' },
    { time: '10:25 AM', event: 'Sarah Wilson marked present', type: 'checkin' },
    { time: '10:20 AM', event: 'Mike Johnson marked present', type: 'checkin' },
    { time: '10:15 AM', event: 'Daily attendance snapshot taken', type: 'system' },
    { time: '10:10 AM', event: 'Emma Davis marked present', type: 'checkin' }
  ];

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
        {stats.map((stat) => (
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
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last week</span>
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
                {recentActivity.map((activity, index) => (
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
                ))}
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