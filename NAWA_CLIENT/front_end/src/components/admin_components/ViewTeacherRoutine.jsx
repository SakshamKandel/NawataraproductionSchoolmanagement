import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { getApiUrl } from '../../config/api';

const ViewTeacherRoutine = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routineLoading, setRoutineLoading] = useState(false);

  // Modal state
  const [showDeleteRoutineConfirmModal, setShowDeleteRoutineConfirmModal] = useState(false);
  const [routineToDeleteContext, setRoutineToDeleteContext] = useState(null); // { day, period }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchTeacherRoutine(selectedTeacher);
    }
  }, [selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/getTeachers'), {
        withCredentials: true
      });
      setTeachers(response.data);
      if (response.data.length > 0) {
        setSelectedTeacher(response.data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch teachers');
      setLoading(false);
    }
  };

  const fetchTeacherRoutine = async (teacherId) => {
    try {
      setRoutineLoading(true);
      const response = await axios.get(getApiUrl(`/api/teacher/${teacherId}/routine`), {
        withCredentials: true
      });
      setRoutines(response.data);
      setRoutineLoading(false);
    } catch (error) {
      console.error('Error fetching routine:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch routine');
      setRoutineLoading(false);
    }
  };

  const handleTeacherChange = (e) => {
    setSelectedTeacher(e.target.value);
  };

  const handleDeleteRoutine = async (day, period) => {
    setRoutineToDeleteContext({ day, period });
    setShowDeleteRoutineConfirmModal(true);
  };

  const confirmDeleteRoutineAction = async () => {
    if (!routineToDeleteContext) return;

    const { day, period } = routineToDeleteContext;

    try {
      await axios.delete(getApiUrl('/api/routine'), {
        data: { 
          teacherId: selectedTeacher,
          day,
          period
        },
        withCredentials: true
      });
      
      toast.success('Routine entry deleted successfully');
      fetchTeacherRoutine(selectedTeacher); // Refresh routines
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast.error(error.response?.data?.message || 'Failed to delete routine');
    }
    setShowDeleteRoutineConfirmModal(false);
    setRoutineToDeleteContext(null);
  };

  // Create a structured schedule for display
  const scheduleByDay = days.reduce((acc, day) => {
    acc[day] = Array(periods.length).fill(null);
    return acc;
  }, {});

  // Populate the schedule with routine data
  routines.forEach(routine => {
    const dayIndex = days.indexOf(routine.day);
    const periodIndex = routine.period - 1;
    
    if (dayIndex !== -1 && periodIndex >= 0 && periodIndex < periods.length) {
      if (!scheduleByDay[routine.day]) {
        scheduleByDay[routine.day] = Array(periods.length).fill(null);
      }
      scheduleByDay[routine.day][periodIndex] = routine;
    }
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading teachers...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Teacher Routine</h2>
      
      {teachers.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          No teachers available. Please add teachers first.
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Select Teacher</label>
            <select
              value={selectedTeacher}
              onChange={handleTeacherChange}
              className="w-full md:w-1/2 lg:w-1/3 px-3 py-2 border rounded-md"
            >
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          {routineLoading ? (
            <div className="flex justify-center items-center h-64">Loading routine...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Day / Period</th>
                    {periods.map(period => (
                      <th key={period} className="border px-4 py-2">Period {period}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <td className="border px-4 py-2 font-semibold">{day}</td>
                      {periods.map(period => {
                        const routine = scheduleByDay[day][period - 1];
                        return (
                          <td key={period} className="border px-4 py-2">
                            {routine ? (
                              <div>
                                <div className="font-medium">{routine.subject}</div>
                                <div className="text-sm text-gray-500">{routine.class}</div>
                                <button 
                                  onClick={() => handleDeleteRoutine(day, period)}
                                  className="mt-1 text-xs text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400">No class</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Delete Routine Confirmation Modal */}
      {showDeleteRoutineConfirmModal && routineToDeleteContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-start">
              <FiAlertTriangle className="text-2xl text-red-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete the routine entry for Period {routineToDeleteContext.period} on {routineToDeleteContext.day}?
                </p>
              </div>
              <button onClick={() => setShowDeleteRoutineConfirmModal(false)} className="ml-auto text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteRoutineConfirmModal(false);
                  setRoutineToDeleteContext(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRoutineAction}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTeacherRoutine; 