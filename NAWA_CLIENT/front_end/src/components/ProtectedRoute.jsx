import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireSuperAdmin = false, requireAdmin = false }) => {
  const { isLoading, adminLoggedIn, isSuperAdmin, hasAdminAccess } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h2>
          <p className="text-red-500">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">This page requires super admin privileges.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !hasAdminAccess()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h2>
          <p className="text-red-500">You need admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Please login with an admin account.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;