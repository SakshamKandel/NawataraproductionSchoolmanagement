import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

configDotenv();

const JWT_SECRET = process.env.SECRET_KEY || 'your_jwt_secret_key';

/**
 * General token verification middleware
 * Detects user type from cookies and attaches appropriate user object
 */
export const verifyToken = async (req, res, next) => {
  if (!req.cookies) {
    console.error('[verifyToken] req.cookies is undefined. CookieParser might not be working or is not used before this middleware.');
    return res.status(500).json({ message: 'Server configuration error regarding cookies.' });
  }
  const adminToken = req.cookies.adminToken;
  const teacherToken = req.cookies.teacherToken;
  const studentToken = req.cookies.studentToken;
  
  if (!adminToken && !teacherToken && !studentToken) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Check admin token
    if (adminToken) {
      const decoded = jwt.verify(adminToken, JWT_SECRET);
      req.user = decoded.user;
      // Fetch admin from database to ensure they still exist
      const admin = await Admin.findByPk(decoded.user.id);
      if (admin) {
        req.admin = admin;
      } else {
        return res.status(401).json({ message: 'Admin account no longer exists.' });
      }
    }
    // Check teacher token
    else if (teacherToken) {
      const decoded = jwt.verify(teacherToken, JWT_SECRET);
      req.user = decoded.user;
      // Fetch teacher from database to ensure they still exist
      const teacher = await Teacher.findByPk(decoded.user.id);
      if (teacher) {
        req.teacher = teacher;
      } else {
        return res.status(401).json({ message: 'Teacher account no longer exists.' });
      }
    }
    // Check student token
    else if (studentToken) {
      const decoded = jwt.verify(studentToken, JWT_SECRET);
      req.user = decoded.user;
      // Fetch student from database to ensure they still exist
      const student = await Student.findByPk(decoded.user.id);
      if (student) {
        req.student = student;
      } else {
        return res.status(401).json({ message: 'Student account no longer exists.' });
      }
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token. Please log in again.' });
    } else {
      res.status(400).json({ message: 'Authentication error. Please log in again.' });
    }
  }
};

/**
 * Verify admin access middleware
 */
export const verifyAdmin = async (req, res, next) => {
  if (!req.cookies) {
    console.error('[verifyAdmin] req.cookies is undefined. CookieParser might not be working or is not used before this middleware.');
    return res.status(500).json({ message: 'Server configuration error regarding cookies.' });
  }
  const token = req.cookies.adminToken;
  console.log('Verifying admin access, token exists:', !!token);
  
  if (!token) {
    return res.status(401).json({ message: 'Admin access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', JSON.stringify(decoded));
    
    if (!decoded.user || (decoded.user.role !== 'Admin' && decoded.user.role !== 'admin')) {
      console.log('Role check failed. User:', JSON.stringify(decoded.user));
      return res.status(403).json({ message: 'Forbidden: Admins only.' });
    }
    
    // Fetch admin from database to ensure they still exist
    const admin = await Admin.findByPk(decoded.user.id);
    if (!admin) {
      return res.status(403).json({ message: 'Admin account not found or deactivated.' });
    }
    
    req.user = decoded.user;
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Admin token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid admin token. Please log in again.' });
    } else {
      res.status(400).json({ message: 'Authentication error. Please log in again.' });
    }
  }
};

/**
 * Verify teacher access middleware
 */
export const verifyTeacher = async (req, res, next) => {
  if (!req.cookies) {
    console.error('[verifyTeacher] req.cookies is undefined. CookieParser might not be working or is not used before this middleware.');
    return res.status(500).json({ message: 'Server configuration error regarding cookies.' });
  }
  const token = req.cookies.teacherToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Teacher access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.user || decoded.user.role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Teachers only.' });
    }
    
    // Fetch teacher from database to ensure they still exist
    const teacher = await Teacher.findByPk(decoded.user.id);
    if (!teacher) {
      return res.status(403).json({ message: 'Teacher account not found or deactivated.' });
    }
    
    req.user = decoded.user;
    req.teacher = teacher;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Teacher token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid teacher token. Please log in again.' });
    } else {
      res.status(400).json({ message: 'Authentication error. Please log in again.' });
    }
  }
};

/**
 * Verify student access middleware
 */
export const verifyStudent = async (req, res, next) => {
  if (!req.cookies) {
    console.error('[verifyStudent] req.cookies is undefined. CookieParser might not be working or is not used before this middleware.');
    return res.status(500).json({ message: 'Server configuration error regarding cookies.' });
  }
  const token = req.cookies.studentToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Student access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.user || decoded.user.role !== 'Student') {
      return res.status(403).json({ message: 'Forbidden: Students only.' });
    }
    
    // Fetch student from database to ensure they still exist
    const student = await Student.findByPk(decoded.user.id);
    if (!student) {
      return res.status(403).json({ message: 'Student account not found or deactivated.' });
    }
    
    req.user = decoded.user;
    req.student = student;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Student token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid student token. Please log in again.' });
    } else {
      res.status(400).json({ message: 'Authentication error. Please log in again.' });
    }
  }
};

/**
 * Combined role verification middleware
 * Use when route can be accessed by multiple role types
 */
export const verifyRoles = (roles) => {
  return async (req, res, next) => {
    if (!req.cookies) {
      console.error('[verifyRoles] req.cookies is undefined. CookieParser might not be working or is not used before this middleware.');
      return res.status(500).json({ message: 'Server configuration error regarding cookies.' });
    }
    
    // Check if user has the required role
    if (req.user && req.user.role) {
      const userRole = req.user.role;
      if (roles.includes(userRole)) {
        return next();
      }
    }
    
    return res.status(403).json({ 
      message: `Access denied. This route requires one of these roles: ${roles.join(', ')}` 
    });
  };
}

/**
 * Middleware to verify if the logged-in admin is one of the specific admins allowed to access certain routes.
 * Expects req.admin to be populated by a preceding verifyAdmin middleware.
 */
export const verifySpecificAdmin = (req, res, next) => {
  // Ensure req.admin and req.admin.email exist (populated by verifyAdmin)
  const allowedEmails = [
    'admin@gmail.com',
    'developer@gmail.com', 
    'admin@nawataraenglishschool.com',
    'developer@nawataraenglishschool.com'
  ];
  
  if (
    req.admin &&
    req.admin.email &&
    allowedEmails.includes(req.admin.email)
  ) {
    next(); // Allowed
  } else {
    // Log the admin email if it exists, for debugging
    if (req.admin && req.admin.email) {
      console.log(`Access attempt to restricted admin area by: ${req.admin.email}`);
    } else {
      // This case should ideally not be reached if verifyAdmin ran correctly
      console.log('Access attempt to restricted admin area: req.admin or req.admin.email is missing after verifyAdmin.');
    }
    return res.status(403).json({ message: "You are not authorized to perform this specific admin action." });
  }
};
 