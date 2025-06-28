import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUsers, FiKey, FiTrash2, FiAlertCircle, FiLoader, FiEdit3, FiEye, FiEyeOff, FiX, FiShield, FiStar, FiAward, FiCode } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config/api';
import { renderError } from '../../utils/errorUtils.js';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Reset Other Admin's Password Modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedAdminForPasswordReset, setSelectedAdminForPasswordReset] = useState(null);
  const [newPasswordForReset, setNewPasswordForReset] = useState('');
  const [confirmNewPasswordForReset, setConfirmNewPasswordForReset] = useState('');
  const [showNewPasswordReset, setShowNewPasswordReset] = useState(false);
  const [showConfirmNewPasswordReset, setShowConfirmNewPasswordReset] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  // States for Change Own Password Modal
  const [showChangeOwnPasswordModal, setShowChangeOwnPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPasswordOwn, setNewPasswordOwn] = useState('');
  const [confirmNewPasswordOwn, setConfirmNewPasswordOwn] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPasswordOwn, setShowNewPasswordOwn] = useState(false);
  const [showConfirmNewPasswordOwn, setShowConfirmNewPasswordOwn] = useState(false);
  const [ownPasswordChangeLoading, setOwnPasswordChangeLoading] = useState(false);

  // States for Delete Admin Confirmation Modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const allowedEmails = [
    'admin@nawataraenglishschool.com',
    'developer@nawataraenglishschool.com',
    'admin@gmail.com', 
    'developer@gmail.com'
  ];
  const userEmail = (localStorage.getItem('email') || '').trim().toLowerCase();
  const isSuperAdmin = allowedEmails.includes(userEmail);
  const isDeveloper = userEmail === 'developer@nawataraenglishschool.com' || userEmail === 'developer@gmail.com';
  const isMainAdmin = userEmail === 'admin@nawataraenglishschool.com' || userEmail === 'admin@gmail.com';
  const isEnhancedUser = userEmail === 'admin@nawataraenglishschool.com' || userEmail === 'developer@nawataraenglishschool.com';
  const navigate = useNavigate();

  // Helper functions for enhanced styling
  const getAdminBadge = (email) => {
    if (email === 'admin@nawataraenglishschool.com') {
      return (
        <div className="flex items-center space-x-1">
          <div className="relative">
            <FiAward className="text-yellow-500 text-lg" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            SUPER ADMIN
          </span>
        </div>
      );
    } else if (email === 'developer@nawataraenglishschool.com') {
      return (
        <div className="flex items-center space-x-1">
          <div className="relative">
            <FiCode className="text-purple-500 text-lg" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
          <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            DEVELOPER
          </span>
        </div>
      );
    } else if (email === 'admin@gmail.com') {
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          ADMIN
        </span>
      );
    } else if (email === 'developer@gmail.com') {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
          DEV
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
        ADMIN
      </span>
    );
  };

  const getEnhancedRowStyle = (email) => {
    if (email === 'admin@nawataraenglishschool.com') {
      return "bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 hover:from-yellow-100 hover:to-orange-100";
    } else if (email === 'developer@nawataraenglishschool.com') {
      return "bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 hover:from-purple-100 hover:to-indigo-100";
    }
    return "hover:bg-gray-50";
  };

  useEffect(() => {
    if (!allowedEmails.includes(userEmail)) {
      toast.error('You are not authorized to access this page.');
      navigate('/');
    }
  }, [userEmail, navigate]);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(getApiUrl('/api/admins'), { withCredentials: true });
      setAdmins(response.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch admin accounts. You may not have permission.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDeleteAdmin = async (adminId, adminEmail) => {
    // Client-side checks
    if (adminEmail === userEmail) {
      toast.error("You cannot delete your own account from this interface.");
      return;
    }
    
    const isMainAdminTarget = adminEmail === 'admin@gmail.com' || adminEmail === 'admin@nawataraenglishschool.com';
    const isDeveloperUser = userEmail === 'developer@gmail.com' || userEmail === 'developer@nawataraenglishschool.com';
    
    if (isMainAdminTarget && !isDeveloperUser) {
        toast.error("The main admin account can only be deleted by developer.");
        return;
    }
    
    const isAdminUser = userEmail === 'admin@gmail.com' || userEmail === 'admin@nawataraenglishschool.com';
    const isDeveloperTarget = adminEmail === 'developer@gmail.com' || adminEmail === 'developer@nawataraenglishschool.com';
    
    if (isAdminUser && isDeveloperTarget) {
        toast.error("Admin is not allowed to delete developer account.");
        return;
    }
    // Set admin to delete and show confirmation modal
    setAdminToDelete({ id: adminId, email: adminEmail });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteAdminAction = async () => {
    if (!adminToDelete) return;

    setDeleteLoading(true);
    // setLoading(true); // Use deleteLoading for the modal, setLoading for the table if needed for consistency
    try {
      await axios.delete(getApiUrl(`/api/admins/${adminToDelete.id}`), { withCredentials: true });
      toast.success(`Admin ${adminToDelete.email} deleted successfully.`);
      fetchAdmins(); // Refetch admins list, which will also handle main page loading state
    } catch (err) {
      console.error("Error deleting admin:", err);
      const errorMessage = err.response?.data?.message || 'Failed to delete admin account.';
      toast.error(errorMessage);
    }
    setDeleteLoading(false);
    setShowDeleteConfirmModal(false);
    setAdminToDelete(null);
    // setLoading(false); // fetchAdmins will handle this
  };

  // --- Reset Other Admin's Password ---
  const openResetPasswordModal = (admin) => {
    if (admin.email === userEmail) {
      toast.info("To change your own password, please use the dedicated 'Change My Password' button.");
      return;
    }
    
    const isMainAdminTarget = admin.email === 'admin@gmail.com' || admin.email === 'admin@nawataraenglishschool.com';
    const isDeveloperUser = userEmail === 'developer@gmail.com' || userEmail === 'developer@nawataraenglishschool.com';
    
    if (isMainAdminTarget && !isDeveloperUser) {
        toast.error("Only developer can reset the main admin account password.");
        return;
    }
    
    const isAdminUser = userEmail === 'admin@gmail.com' || userEmail === 'admin@nawataraenglishschool.com';
    const isDeveloperTarget = admin.email === 'developer@gmail.com' || admin.email === 'developer@nawataraenglishschool.com';
    
    if (isAdminUser && isDeveloperTarget) {
        toast.error("Admin is not allowed to reset developer's password.");
        return;
    }

    setSelectedAdminForPasswordReset(admin);
    setNewPasswordForReset('');
    setConfirmNewPasswordForReset('');
    setShowNewPasswordReset(false);
    setShowConfirmNewPasswordReset(false);
    setShowResetPasswordModal(true);
  };
  
  const handleResetOtherAdminPassword = async () => {
    if (!selectedAdminForPasswordReset || !newPasswordForReset.trim()) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPasswordForReset.length < 6) {
      toast.warn('Password must be at least 6 characters long.');
      return;
    }
    if (newPasswordForReset !== confirmNewPasswordForReset) {
      toast.error('Passwords do not match.');
      return;
    }

    setPasswordResetLoading(true);
    try {
      await axios.put(
        getApiUrl(`/api/admins/${selectedAdminForPasswordReset.id}/reset-password`),
        { newPassword: newPasswordForReset },
        { withCredentials: true }
      );
      toast.success(`Password for ${selectedAdminForPasswordReset.email} has been reset successfully.`);
      setShowResetPasswordModal(false);
      setSelectedAdminForPasswordReset(null);
    } catch (err) {
      console.error("Error resetting password:", err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password.';
      toast.error(errorMessage);
    }
    setPasswordResetLoading(false);
  };

  // --- Change Own Password ---
  const openChangeOwnPasswordModal = () => {
    setOldPassword('');
    setNewPasswordOwn('');
    setConfirmNewPasswordOwn('');
    setShowOldPassword(false);
    setShowNewPasswordOwn(false);
    setShowConfirmNewPasswordOwn(false);
    setShowChangeOwnPasswordModal(true);
  };

  const handleChangeOwnPasswordSubmit = async () => {
    if (!oldPassword.trim() || !newPasswordOwn.trim()) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPasswordOwn.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPasswordOwn !== confirmNewPasswordOwn) {
      toast.error("New passwords do not match.");
      return;
    }

    setOwnPasswordChangeLoading(true);
    try {
      await axios.post(getApiUrl('/api/admins/me/change-password'),
        { oldPassword, newPassword: newPasswordOwn },
        { withCredentials: true }
      );
      toast.success("Your password has been changed successfully.");
      setShowChangeOwnPasswordModal(false);
    } catch (err) {
      console.error("Error changing own password:", err);
      const errorMessage = err.response?.data?.message || 'Failed to change your password.';
      toast.error(errorMessage);
    }
    setOwnPasswordChangeLoading(false);
  };

  const filteredAdmins = isMainAdmin
    ? admins.filter(admin => 
        admin.email !== 'developer@gmail.com' && 
        admin.email !== 'developer@nawataraenglishschool.com'
      )
    : admins;

  if (loading && !admins.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-200 flex flex-col items-center justify-center text-gray-700">
        <FiLoader className="animate-spin text-5xl mb-4 text-blue-600" />
        <p className="text-xl font-semibold text-gray-700">Loading Admin Data...</p>
        <p className="text-gray-500">Please wait while we fetch the information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-200 flex flex-col items-center justify-center text-red-600 bg-red-50 p-8 rounded-lg shadow-md">
        <FiAlertCircle className="text-6xl mb-4" />
        <h2 className="text-3xl font-semibold mb-3">Access Denied or Error</h2>
        <p className="text-center max-w-md text-lg">{renderError(error)}</p>
        <p className="text-md text-gray-500 mt-4">Please ensure you are logged in with an authorized account.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${isEnhancedUser ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50' : ''}`}>
      <div className={`max-w-7xl mx-auto ${(showResetPasswordModal || showChangeOwnPasswordModal || showDeleteConfirmModal) ? 'filter blur-sm brightness-75' : ''}`}>
        {/* Enhanced Welcome Banner */}
        {isEnhancedUser && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg ${
            userEmail === 'admin@nawataraenglishschool.com' 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' 
              : 'bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600'
          }`}>
            <div className="flex items-center justify-center space-x-3 text-white">
              <div className="relative">
                {userEmail === 'admin@nawataraenglishschool.com' ? (
                  <FiAward className="text-2xl animate-bounce" />
                ) : (
                  <FiCode className="text-2xl animate-pulse" />
                )}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">
                  Welcome, {userEmail === 'admin@nawataraenglishschool.com' ? 'System Administrator' : 'Lead Developer'}!
                </h2>
                <p className="text-sm opacity-90">
                  {userEmail === 'admin@nawataraenglishschool.com' 
                    ? 'You have complete administrative control and system oversight' 
                    : 'You have full development access and technical administration rights'
                  }
                </p>
              </div>
              <div className="flex space-x-1">
                <FiStar className="text-yellow-300 animate-pulse" />
                <FiStar className="text-yellow-300 animate-pulse" />
                <FiStar className="text-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <FiUsers className={`text-5xl ${isEnhancedUser ? 'text-indigo-600' : 'text-blue-600'}`} />
            {isEnhancedUser && <FiShield className="text-3xl text-green-500 animate-pulse" />}
          </div>
          <h1 className={`text-4xl font-extrabold tracking-tight ${
            isEnhancedUser 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent' 
              : 'text-gray-800'
          }`}>
            Administrative Management
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            {isEnhancedUser 
              ? 'Comprehensive administrative control with advanced features and enhanced security oversight'
              : 'Oversee administrator accounts, manage credentials, and maintain system security.'
            }
          </p>
          {userEmail && (
            <button
              onClick={openChangeOwnPasswordModal}
              className={`mt-6 inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white transition-all duration-150 ease-in-out transform hover:scale-105 ${
                isEnhancedUser
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500'
                  : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <FiEdit3 className="mr-2 h-5 w-5" /> 
              {isEnhancedUser ? 'Update My Password' : 'Change My Password'}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {loading && admins.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <FiLoader className="animate-spin text-4xl text-blue-500" />
            </div>
          )}
          {admins.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <FiAlertCircle className="text-6xl text-orange-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Admin Accounts</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                There are currently no administrator accounts registered in the system.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className={`${isEnhancedUser ? 'bg-gradient-to-r from-indigo-100 to-purple-100' : 'bg-slate-100'}`}>
                  <tr>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isEnhancedUser ? 'text-indigo-700' : 'text-gray-700'}`}>S.N.</th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isEnhancedUser ? 'text-indigo-700' : 'text-gray-700'}`}>Admin</th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isEnhancedUser ? 'text-indigo-700' : 'text-gray-700'}`}>Email</th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isEnhancedUser ? 'text-indigo-700' : 'text-gray-700'}`}>Status</th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isEnhancedUser ? 'text-indigo-700' : 'text-gray-700'}`}>Joined</th>
                    <th scope="col" className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${isEnhancedUser ? 'text-indigo-700' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin, index) => {
                    const isSelf = admin.email === userEmail;
                    const isTargetMainAdminAccount = admin.email === 'admin@gmail.com' || admin.email === 'admin@nawataraenglishschool.com';
                    const isAdminAttemptingDevAction = (userEmail === 'admin@gmail.com' || userEmail === 'admin@nawataraenglishschool.com') && 
                                                      (admin.email === 'developer@gmail.com' || admin.email === 'developer@nawataraenglishschool.com');
                    
                    const isDeveloperUser = userEmail === 'developer@gmail.com' || userEmail === 'developer@nawataraenglishschool.com';
                    const canDelete = !isSelf && !(isTargetMainAdminAccount && !isDeveloperUser) && !isAdminAttemptingDevAction;
                    
                    let canResetPassword = false;
                    let resetTitle = "Reset Password";

                    if (isSelf) {
                      canResetPassword = false;
                      resetTitle = "Use 'Change My Password' button";
                    } else if (isTargetMainAdminAccount) {
                      canResetPassword = isDeveloperUser;
                      if (!canResetPassword) resetTitle = "Only Developer can reset Main Admin's password";
                    } else if (admin.email === 'developer@gmail.com' || admin.email === 'developer@nawataraenglishschool.com') {
                      canResetPassword = !(userEmail === 'admin@gmail.com' || userEmail === 'admin@nawataraenglishschool.com');
                       if(userEmail === 'admin@gmail.com' || userEmail === 'admin@nawataraenglishschool.com') resetTitle = "admin cannot reset Developer's password";
                    } else {
                      canResetPassword = true;
                    }
                    
                    let deleteTitle = "Delete Admin";
                    if(isSelf) deleteTitle = "Cannot delete self";
                    else if(isTargetMainAdminAccount) deleteTitle = "Cannot delete main admin";
                    else if(isAdminAttemptingDevAction) deleteTitle = "admin cannot delete developer";

                    if (
                      (admin.email === 'admin@gmail.com' || admin.email === 'admin@nawataraenglishschool.com') &&
                      !isDeveloper
                    ) {
                      return null; // Don't show reset button
                    }

                    if (
                      (admin.email === 'developer@gmail.com' || admin.email === 'developer@nawataraenglishschool.com') &&
                      isMainAdmin
                    ) {
                      return null; // Don't show reset button
                    }

                    return (
                      <tr key={admin.id} className={`transition-colors duration-150 ease-in-out ${getEnhancedRowStyle(admin.email)}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                                admin.email === 'admin@nawataraenglishschool.com' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                admin.email === 'developer@nawataraenglishschool.com' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                                'bg-blue-500'
                              }`}>
                                {admin.name ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()}
                                {(admin.email === 'admin@nawataraenglishschool.com' || admin.email === 'developer@nawataraenglishschool.com') && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                                <span>{admin.name || 'N/A'}</span>
                                {(admin.email === 'admin@nawataraenglishschool.com' || admin.email === 'developer@nawataraenglishschool.com') && (
                                  <FiStar className="text-yellow-500 text-xs" />
                                )}
                              </div>
                              <div className="text-xs text-gray-500">ID: {admin.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <span>{admin.email}</span>
                            {(admin.email === 'admin@nawataraenglishschool.com' || admin.email === 'developer@nawataraenglishschool.com') && (
                              <FiShield className="text-green-500 text-sm animate-pulse" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {getAdminBadge(admin.email)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(admin.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                          <button
                            onClick={() => openResetPasswordModal(admin)}
                            disabled={!canResetPassword}
                            title={resetTitle}
                            className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white transition-all duration-150 ease-in-out transform hover:scale-110 ${
                              canResetPassword 
                                ? (admin.email === 'admin@nawataraenglishschool.com' || admin.email === 'developer@nawataraenglishschool.com') 
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <FiKey className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                            disabled={!canDelete}
                            title={deleteTitle}
                             className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white transition-all duration-150 ease-in-out transform hover:scale-110 ${
                              canDelete 
                                ? (admin.email === 'admin@nawataraenglishschool.com' || admin.email === 'developer@nawataraenglishschool.com') 
                                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500' 
                                  : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showResetPasswordModal && selectedAdminForPasswordReset && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
          <div className="relative bg-white p-6 sm:p-8 border border-gray-300 w-full max-w-lg shadow-2xl rounded-xl transform transition-all duration-300 ease-in-out animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiKey className="mr-3 text-blue-600" />
                Reset Admin Password
              </h3>
              <button 
                onClick={() => setShowResetPasswordModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Resetting password for: <span className="font-semibold text-blue-700">{selectedAdminForPasswordReset.email}</span> (ID: {selectedAdminForPasswordReset.id})
            </p>
            <div className="space-y-5">
              <div className="relative">
                <label htmlFor="newPasswordForReset" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  id="newPasswordForReset"
                  type={showNewPasswordReset ? "text" : "password"}
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPasswordForReset}
                  onChange={(e) => setNewPasswordForReset(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm transition-shadow duration-150 ease-in-out"
                />
                <button type="button" onClick={() => setShowNewPasswordReset(!showNewPasswordReset)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 top-7">
                  {showNewPasswordReset ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirmNewPasswordForReset" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  id="confirmNewPasswordForReset"
                  type={showConfirmNewPasswordReset ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmNewPasswordForReset}
                  onChange={(e) => setConfirmNewPasswordForReset(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm transition-shadow duration-150 ease-in-out"
                />
                <button type="button" onClick={() => setShowConfirmNewPasswordReset(!showConfirmNewPasswordReset)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 top-7">
                  {showConfirmNewPasswordReset ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row-reverse sm:gap-3">
              <button
                onClick={handleResetOtherAdminPassword}
                disabled={passwordResetLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out transform hover:scale-105 ${
                  passwordResetLoading ? 'opacity-60 cursor-wait' : ''
                }`}
              >
                {passwordResetLoading ? <FiLoader className="animate-spin mr-2 h-5 w-5" /> : <FiKey className="mr-2 h-5 w-5" />}
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setShowResetPasswordModal(false)}
                className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 px-6 py-2.5 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangeOwnPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
          <div className="relative bg-white p-6 sm:p-8 border border-gray-300 w-full max-w-lg shadow-2xl rounded-xl transform transition-all duration-300 ease-in-out animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiEdit3 className="mr-3 text-purple-600" />
                Change My Password
              </h3>
              <button 
                onClick={() => setShowChangeOwnPasswordModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
             <div className="space-y-5">
              <div className="relative">
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm transition-shadow duration-150 ease-in-out"
                />
                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600 top-7">
                  {showOldPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
               <div className="relative">
                <label htmlFor="newPasswordOwn" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  id="newPasswordOwn"
                  type={showNewPasswordOwn ? "text" : "password"}
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPasswordOwn}
                  onChange={(e) => setNewPasswordOwn(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm transition-shadow duration-150 ease-in-out"
                />
                <button type="button" onClick={() => setShowNewPasswordOwn(!showNewPasswordOwn)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600 top-7">
                  {showNewPasswordOwn ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirmNewPasswordOwn" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  id="confirmNewPasswordOwn"
                  type={showConfirmNewPasswordOwn ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmNewPasswordOwn}
                  onChange={(e) => setConfirmNewPasswordOwn(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm transition-shadow duration-150 ease-in-out"
                />
                <button type="button" onClick={() => setShowConfirmNewPasswordOwn(!showConfirmNewPasswordOwn)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600 top-7">
                  {showConfirmNewPasswordOwn ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row-reverse sm:gap-3">
              <button
                onClick={handleChangeOwnPasswordSubmit}
                disabled={ownPasswordChangeLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150 ease-in-out transform hover:scale-105 ${
                  ownPasswordChangeLoading ? 'opacity-60 cursor-wait' : ''
                }`}
              >
                {ownPasswordChangeLoading ? <FiLoader className="animate-spin mr-2 h-5 w-5" /> : <FiEdit3 className="mr-2 h-5 w-5" />}
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowChangeOwnPasswordModal(false)}
                className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 px-6 py-2.5 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Admin Confirmation Modal */}
      {showDeleteConfirmModal && adminToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-in-out animate-fade-in">
          <div className="relative bg-white p-6 sm:p-8 border border-gray-300 w-full max-w-md shadow-2xl rounded-xl transform transition-all duration-300 ease-in-out animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600 flex items-center">
                <FiAlertCircle className="mr-3 h-6 w-6" />
                Confirm Deletion
              </h3>
              <button 
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setAdminToDelete(null);
                }} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-md text-gray-700 mb-2">
                Are you sure you want to permanently delete the admin account for:
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-4 break-all">{adminToDelete.email}?</p>
              <FiTrash2 className="mx-auto text-5xl text-red-400 mb-4" />
              <p className="text-sm text-red-500 font-semibold mb-6">
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row-reverse sm:gap-3">
              <button
                onClick={confirmDeleteAdminAction}
                disabled={deleteLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 ease-in-out transform hover:scale-105 ${
                  deleteLoading ? 'opacity-60 cursor-wait' : ''
                }`}
              >
                {deleteLoading ? <FiLoader className="animate-spin mr-2 h-5 w-5" /> : <FiTrash2 className="mr-2 h-5 w-5" />}
                Yes, Delete Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setAdminToDelete(null);
                }}
                disabled={deleteLoading}
                className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 px-6 py-2.5 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ManageAdmins; 