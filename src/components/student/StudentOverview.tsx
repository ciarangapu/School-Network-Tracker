import React from 'react';
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StudentOverview = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const stats = [
    {
      name: 'Attendance Rate',
      value: '92.5%',
      change: '+2.1%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'green'
    },
    {
      name: 'Present Days',
      value: '18',
      change: 'This month',
      changeType: 'neutral',
      icon: CheckCircle,
      color: 'green'
    },
    {
      name: 'Late Arrivals',
      value: '3',
      change: 'This month',
      changeType: 'neutral',
      icon: Clock,
      color: 'yellow'
    },
    {
      name: 'Absent Days',
      value: '2',
      change: 'This month',
      changeType: 'neutral',
      icon: XCircle,
      color: 'red'
    }
  ];

  const recentAttendance = [
    { date: '2024-01-15', status: 'Present', time: '09:15', color: 'green' },
    { date: '2024-01-14', status: 'Present', time: '09:05', color: 'green' },
    { date: '2024-01-13', status: 'Late', time: '09:35', color: 'yellow' },
    { date: '2024-01-12', status: 'Present', time: '08:55', color: 'green' },
    { date: '2024-01-11', status: 'Absent', time: '-', color: 'red' }
  ];

  const upcomingEvents = [
    { date: '2024-01-18', event: 'Project Presentation', time: '10:00 AM' },
    { date: '2024-01-20', event: 'Quiz - JavaScript Fundamentals', time: '02:00 PM' },
    { date: '2024-01-22', event: 'Group Assignment Due', time: '11:59 PM' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Today, {currentDate.toLocaleDateString()}</span>
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
              <div className={`p-3 rounded-full ${
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'yellow' ? 'bg-yellow-100' :
                stat.color === 'red' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  stat.color === 'red' ? 'text-red-600' : 'text-blue-600'
                }`} />
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
        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAttendance.map((record, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      record.color === 'green' ? 'bg-green-500' :
                      record.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500">Check-in: {record.time}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.color === 'green' ? 'bg-green-100 text-green-800' :
                    record.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Attendance Information</h4>
            <p className="text-sm text-blue-800 mt-1">
              Your attendance is tracked automatically based on your device's MAC address. 
              Make sure your device is connected to the network during class hours. 
              If you need to update your MAC address, you can do so from the settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;