import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import StudentOverview from './StudentOverview';
import StudentAttendance from './StudentAttendance';
import MacAddressUpdate from './MacAddressUpdate';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<StudentOverview />} />
            <Route path="/attendance" element={<StudentAttendance />} />
            <Route path="/update-mac" element={<MacAddressUpdate />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;