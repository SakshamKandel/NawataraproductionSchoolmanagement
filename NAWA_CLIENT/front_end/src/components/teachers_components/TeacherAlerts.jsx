import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getApiUrl } from '../../config/api.js';
import { renderError } from '../../utils/errorUtils.js';

const TeacherAlerts = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    const fetchTeacherId = async () => {
      try {
        const storedEmail = localStorage.getItem('email');
        if (!storedEmail) {
          setError('Please log in to view your notices');
          setLoading(false);
          return;
        }

        const response = await axios.get(getApiUrl('/getTeachers'), {
          withCredentials: true
        });
        
        const teacher = response.data.find(t => t.email === storedEmail);
        if (teacher) {
          setTeacherId(teacher._id);
          fetchNotices(teacher._id);
        } else {
          setError('Teacher information not found. Please try logging in again.');
          setLoading(false);
        }
      } catch (error) {
        setError('Error fetching teacher information. Please try again.');
        setLoading(false);
      }
    };

    fetchTeacherId();
  }, []);

  const fetchNotices = async (id) => {
    try {
      const response = await axios.get(getApiUrl(`/teacher-alerts?teacherId=${id}`), {
        withCredentials: true
      });
      setNotices(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch notices');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Notices</h2>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              {renderError(error)}
            </div>
          )}

          {notices.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notices</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't submitted any notices yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{notice.subject}</h3>
                      <p className="mt-1 text-sm text-gray-500">{formatDate(notice.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      notice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      notice.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{notice.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAlerts;