import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Overview from './Overview';
import GroupSettings from './GroupSettings';
import ShiftSettings from './ShiftSettings';
import AttendanceSettings from './AttendanceSettings';
import AttendanceReports from './AttendanceReports';
import StudentManagement from './StudentManagement';
import LiveMacData from './LiveMacData';
import EmailSettings from './EmailSettings';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/groups" element={<GroupSettings />} />
            <Route path="/shifts" element={<ShiftSettings />} />
            <Route path="/settings" element={<AttendanceSettings />} />
            <Route path="/email-settings" element={<EmailSettings />} />
            <Route path="/reports" element={<AttendanceReports />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/live-mac" element={<LiveMacData />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;