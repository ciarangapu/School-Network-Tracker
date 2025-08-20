import React, { useState } from 'react';

type ShiftType = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  active: boolean;
  emailNotification: boolean;
};
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

const ShiftSettings = () => {
  const [shifts, setShifts] = useState([
    {
      id: 1,
      name: 'Morning Shift',
      startTime: '09:00',
      endTime: '18:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      active: true,
      emailNotification: true
    },
    {
      id: 2,
      name: 'Afternoon Shift',
      startTime: '13:00',
      endTime: '22:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      active: true,
      emailNotification: true
    },
    {
      id: 3,
      name: 'Weekend Shift',
      startTime: '10:00',
      endTime: '16:00',
      days: ['Saturday', 'Sunday'],
      active: false,
      emailNotification: false
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
    const [formData, setFormData] = useState<{
      name: string;
      startTime: string;
      endTime: string;
      days: string[];
      active: boolean;
      emailNotification: boolean;
    }>({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
      days: [] as string[],
    active: true,
    emailNotification: true
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift !== null) {
      setShifts(shifts.map((shift: ShiftType) => 
        shift.id === editingShift.id 
          ? { ...shift, ...formData } as ShiftType
          : shift
      ));
    } else {
      setShifts([...shifts, { ...formData, id: Date.now() } as ShiftType]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '18:00',
      days: [],
      active: true,
      emailNotification: true
    });
    setEditingShift(null);
    setShowModal(false);
  };

  const editShift = (shift: any) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      days: shift.days,
      active: shift.active,
      emailNotification: shift.emailNotification
    });
    setShowModal(true);
  };

  const deleteShift = (id: number) => {
    setShifts(shifts.filter(shift => shift.id !== id));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shift Settings</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Shift</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift) => (
          <div key={shift.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{shift.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => editShift(shift)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteShift(shift.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Days:</p>
                <div className="flex flex-wrap gap-1">
                  {shift.days.map(day => (
                    <span
                      key={day}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shift.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {shift.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Email Notification:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shift.emailNotification
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {shift.emailNotification ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Shift Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingShift ? 'Edit Shift' : 'Add New Shift'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Days
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {weekDays.map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day)}
                        onChange={() => toggleDay(day)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.emailNotification}
                    onChange={(e) => setFormData({...formData, emailNotification: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Email Notification</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingShift ? 'Update Shift' : 'Add Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSettings;