import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApiUrl } from '../../config/api.js';
import { renderError } from '../../utils/errorUtils.js';

const SubmitNotice = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticesError, setNoticesError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch teacher ID when component mounts
    const fetchTeacherId = async () => {
      try {
        const storedEmail = localStorage.getItem('email');
        console.log('Stored email:', storedEmail);

        if (!storedEmail) {
          setMessage('Please log in to submit a notice');
          return;
        }

        const response = await axios.get(getApiUrl('/getTeachers'), {
          withCredentials: true
        });
        
        console.log('Teachers data:', response.data);
        
        const teacher = response.data.find(t => t.email === storedEmail);
        console.log('Found teacher:', teacher);

        if (teacher) {
          setTeacherId(teacher._id || teacher.id);
          setMessage('');
        } else {
          setMessage('Teacher information not found. Please try logging in again.');
        }
      } catch (error) {
        console.error('Error fetching teacher:', error);
        setMessage('Error fetching teacher information. Please try again.');
      }
    };
    fetchTeacherId();
  }, []);

  useEffect(() => {
    // Fetch teacher's own notices when teacherId is set
    const fetchNotices = async () => {
      if (!teacherId) return;
      setNoticesLoading(true);
      setNoticesError('');
      try {
        const response = await axios.get(getApiUrl(`/teacher-alerts?teacherId=${teacherId}`), {
          withCredentials: true
        });
        setNotices(response.data);
      } catch (error) {
        setNoticesError('Failed to fetch your notices');
      }
      setNoticesLoading(false);
    };
    fetchNotices();
  }, [teacherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      setMessage('Error: Teacher information not found. Please try logging in again.');
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      setMessage('Please fill in both subject and message fields.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('Submitting notice with data:', { ...formData, teacherId });
      const response = await axios.post(getApiUrl('/create-notice'), {
        ...formData,
        teacherId
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Notice submission response:', response.data);
      setMessage('Notice submitted successfully!');
      setFormData({ subject: '', message: '' });
      toast.success('Notice submitted successfully!');
      // Refresh the notices list after successful submission
      if (teacherId) {
        const response = await axios.get(getApiUrl(`/teacher-alerts?teacherId=${teacherId}`), {
          withCredentials: true
        });
        setNotices(response.data);
      }
    } catch (error) {
      console.error('Error submitting notice:', error);
      const errorMessage = error.response?.data?.message || 'Error submitting notice. Please try again.';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Notice</h2>
          
          {message && (
            <div className={`p-4 mb-4 rounded-md ${
              message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter notice subject"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                rows="6"
                required
                value={formData.message}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your notice message"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !teacherId || !formData.subject.trim() || !formData.message.trim()}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (loading || !teacherId || !formData.subject.trim() || !formData.message.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : 'Submit Notice'}
            </button>
          </form>
        </div>

      {/* Teacher's own notices below the form */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Notices</h2>
          {noticesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : noticesError ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">{renderError(noticesError)}</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notices</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't submitted any notices yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{notice.subject}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
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

export default SubmitNotice;