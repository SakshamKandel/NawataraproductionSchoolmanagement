import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    adminLoggedIn: false,
    teacherLoggedIn: false,
    studentLoggedIn: false,
    userEmail: null,
    userType: null
  });

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const adminToken = document.cookie.includes("adminToken");
        const teacherToken = document.cookie.includes("teacherToken");
        const studentToken = document.cookie.includes("studentToken");
        const email = localStorage.getItem('email');
        
        let userType = null;
        if (adminToken) userType = 'admin';
        else if (teacherToken) userType = 'teacher';
        else if (studentToken) userType = 'student';

        setAuthState({
          isLoading: false,
          adminLoggedIn: adminToken,
          teacherLoggedIn: teacherToken,
          studentLoggedIn: studentToken,
          userEmail: email,
          userType
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          isLoading: false,
          adminLoggedIn: false,
          teacherLoggedIn: false,
          studentLoggedIn: false,
          userEmail: null,
          userType: null
        });
      }
    };

    initializeAuth();
  }, []);

  const isSuperAdmin = () => {
    const allowedEmails = [
      'developer@nawataraenglishschool.com',
      'admin@nawataraenglishschool.com'
    ];
    const userEmail = (authState.userEmail || '').trim().toLowerCase();
    return allowedEmails.includes(userEmail);
  };

  const hasAdminAccess = () => {
    return authState.adminLoggedIn && authState.userEmail;
  };

  const value = {
    ...authState,
    isSuperAdmin,
    hasAdminAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};