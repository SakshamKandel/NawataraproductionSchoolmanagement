import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUsers, FiKey, FiTrash2, FiAlertCircle, FiCheckCircle, FiLoader, FiPlusCircle, FiEdit3, FiEyeOff, FiEye, FiX } from 'react-icons/fi';
import { getApiUrl } from '../../config/api.js';

const RemoveTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingTeacherId, setRemovingTeacherId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTeacherForPassword, setSelectedTeacherForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // States for Delete Teacher Confirmation Modal
  const [showDeleteTeacherConfirmModal, setShowDeleteTeacherConfirmModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleteTeacherLoading, setDeleteTeacherLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(getApiUrl('/api/teachers'), { withCredentials: true });
      setTeachers(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch teachers. Please try again.');
    }
    setLoading(false);
  };

  const handleRemoveTeacher = async (teacherId, teacherName) => {
    // Any specific client-side checks for teachers can go here if needed.
    // For now, we directly proceed to show the modal.
    setTeacherToDelete({ id: teacherId, name: teacherName });
    setShowDeleteTeacherConfirmModal(true);
  };

  const confirmDeleteTeacherAction = async () => {
    if (!teacherToDelete) return;

    setDeleteTeacherLoading(true);
    try {
      await axios.delete(getApiUrl(`/api/teachers/${teacherToDelete.id}`), { withCredentials: true });
      toast.success(`Teacher ${teacherToDelete.name || 'ID: ' + teacherToDelete.id} removed successfully!`);
      // Update teacher list locally or refetch
      setTeachers(prevTeachers => prevTeachers.filter(t => t.id !== teacherToDelete.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove teacher. Please try again.');
    }
    setDeleteTeacherLoading(false);
    setShowDeleteTeacherConfirmModal(false);
    setTeacherToDelete(null);
  };

  const openPasswordModal = (teacher) => {
    setSelectedTeacherForPassword(teacher);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async () => {
    if (!selectedTeacherForPassword || !newPassword.trim()) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.warn('Password should be at least 6 characters long.');
      return;
    }

    setPasswordChangeLoading(true);
    try {
      await axios.put(
        getApiUrl(`/api/teachers/${selectedTeacherForPassword.id}/change-password`),
        { newPassword },
        { withCredentials: true }
      );
      toast.success(`Password changed successfully for ${selectedTeacherForPassword.name}!`);
      setShowPasswordModal(false);
      setSelectedTeacherForPassword(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Please try again.');
    }
    setPasswordChangeLoading(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-7xl mx-auto ${(showPasswordModal || showDeleteTeacherConfirmModal) ? 'filter blur-sm brightness-75' : ''}`}>
        {/* Header Section */}
        <div className="mb-10 text-center">
          <FiUsers className="mx-auto text-5xl text-blue-600 mb-3" />
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Teacher Management</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Oversee teacher accounts, manage credentials, and maintain system integrity.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <FiLoader className="animate-spin text-5xl text-blue-500 mb-4" />
              <p className="text-xl font-semibold text-gray-700">Loading Teachers...</p>
              <p className="text-gray-500">Please wait while we fetch the data.</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <FiAlertCircle className="text-6xl text-orange-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Teachers Found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                There are currently no teacher accounts in the system. You can add new teachers through the 'Create Account' section.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Email & Phone
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-11 w-11">
                            <div className="h-11 w-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {teacher.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-md font-semibold text-gray-900">{teacher.name}</div>
                            <div className="text-xs text-gray-500">ID: {teacher.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{teacher.email}</div>
                        {teacher.phone && (
                          <div className="text-sm text-gray-500 mt-0.5">{teacher.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-700 shadow-sm border border-sky-200">
                          {teacher.subject || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                        <button
                          onClick={() => openPasswordModal(teacher)}
                          title="Change Password"
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out transform hover:scale-110"
                        >
                          <FiKey className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveTeacher(teacher.id, teacher.name)}
                          disabled={deleteTeacherLoading}
                          title="Remove Teacher"
                          className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 ease-in-out transform hover:scale-110 ${
                            deleteTeacherLoading ? 'opacity-50 cursor-wait animate-pulse' : ''
                          }`}
                        >
                          {deleteTeacherLoading ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && selectedTeacherForPassword && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
          <div className="relative bg-white p-6 sm:p-8 border border-gray-300 w-full max-w-lg shadow-2xl rounded-xl transform transition-all duration-300 ease-in-out animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiKey className="mr-3 text-blue-600" />
                Change Password
              </h3>
              <button 
                onClick={() => setShowPasswordModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Updating password for: <span className="font-semibold text-blue-700">{selectedTeacherForPassword.name}</span> (ID: {selectedTeacherForPassword.id})
            </p>

            <div className="space-y-5">
              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm transition-shadow duration-150 ease-in-out"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 top-7">
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm transition-shadow duration-150 ease-in-out"
                />
                <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 top-7">
                  {showConfirmNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row-reverse sm:gap-3">
              <button
                onClick={handlePasswordChange}
                disabled={passwordChangeLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out transform hover:scale-105 ${
                  passwordChangeLoading ? 'opacity-60 cursor-wait' : ''
                }`}
              >
                {passwordChangeLoading ? <FiLoader className="animate-spin mr-2 h-5 w-5" /> : <FiCheckCircle className="mr-2 h-5 w-5" />}
                {passwordChangeLoading ? 'Saving...' : 'Save New Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedTeacherForPassword(null);
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
                className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-150 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Teacher Confirmation Modal */}
      {showDeleteTeacherConfirmModal && teacherToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
          <div className="relative bg-white p-6 sm:p-8 border border-gray-300 w-full max-w-md shadow-2xl rounded-xl transform transition-all duration-300 ease-in-out animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600 flex items-center">
                <FiAlertCircle className="mr-3 h-6 w-6" />
                Confirm Teacher Removal
              </h3>
              <button 
                onClick={() => {
                  setShowDeleteTeacherConfirmModal(false);
                  setTeacherToDelete(null);
                }} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-md text-gray-700 mb-2">
                Are you sure you want to permanently remove the teacher:
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-1 break-all">{teacherToDelete.name || 'N/A'}</p>
              <p className="text-sm text-gray-500 mb-4">(ID: {teacherToDelete.id})?</p>
              <FiTrash2 className="mx-auto text-5xl text-red-400 mb-4" />
              <p className="text-sm text-red-500 font-semibold mb-2">
                This action is permanent.
              </p>
               <p className="text-xs text-gray-600 mb-6">
                Associated records (payroll, routines, etc.) may also be affected or deleted.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row-reverse sm:gap-3">
              <button
                onClick={confirmDeleteTeacherAction}
                disabled={deleteTeacherLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 ease-in-out transform hover:scale-105 ${
                  deleteTeacherLoading ? 'opacity-60 cursor-wait' : ''
                }`}
              >
                {deleteTeacherLoading ? <FiLoader className="animate-spin mr-2 h-5 w-5" /> : <FiTrash2 className="mr-2 h-5 w-5" />}
                Yes, Remove Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteTeacherConfirmModal(false);
                  setTeacherToDelete(null);
                }}
                disabled={deleteTeacherLoading}
                className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 px-6 py-2.5 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add these styles if not already global, or integrate into your CSS strategy */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95) translateY(-10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RemoveTeacher;