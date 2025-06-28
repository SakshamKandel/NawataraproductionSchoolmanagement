import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getApiUrl } from '../../config/api.js';

const AddRoutine = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    teacherId: '',
    day: 'Sunday',
    period: 1,
    subject: '',
    class: ''
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/getTeachers'), {
        withCredentials: true
      });
      setTeachers(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, teacherId: response.data[0].id }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch teachers');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(getApiUrl('/api/routine'), formData, {
        withCredentials: true
      });
      
      toast.success(response.data.message);
      // Reset form fields except teacherId
      setFormData(prev => ({
        ...prev,
        subject: '',
        class: ''
      }));
    } catch (error) {
      console.error('Error adding routine:', error);
      toast.error(error.response?.data?.message || 'Failed to add routine');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading teachers...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Add Teacher Routine</h2>
      
      {teachers.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded-md">
          No teachers available. Please add teachers first.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Select Teacher</label>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Day</label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-2">Period</label>
              <select
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {periods.map(period => (
                  <option key={period} value={period}>Period {period}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
              placeholder="Enter subject name"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Class</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
              placeholder="Enter class (e.g. Class 10)"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Routine
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddRoutine; 