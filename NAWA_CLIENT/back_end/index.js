import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import fs from "fs";
import fetch_teachers from "./routes/admin_accessible_routes/FetchTeachers.js";
import updateRoutine from "./routes/admin_accessible_routes/UpdateRoutine.js";
import get_student from "./routes/admin_accessible_routes/students_data/GetStudents.js";
import get_fee from "./routes/admin_accessible_routes/fees/GetFeeRecord.js";
import class_fee_struct from "./routes/admin_accessible_routes/fees/ClassFeeStructure.js";
import edit_record_fee from "./routes/admin_accessible_routes/fees/EditRecordFee.js";
import fixFeeRecordsRouter from "./routes/admin_accessible_routes/fees/FixFeeRecords.js";
import create_teacher from "./routes/admin_accessible_routes/accounts_creation_route/CreateTeacher.js";
import create_student from "./routes/admin_accessible_routes/accounts_creation_route/CreateStudent.js";
import admin_notice_route from "./routes/admin_accessible_routes/notice/AdminNoticeRoute.js";
import edit_student from "./routes/admin_accessible_routes/students_data/EditStudent.js";
import fetch_routine from "./routes/routines/FetchRoutine.js";
import getNotice from "./routes/notice/GetNotice.js";
import loginRoute from "./routes/login_logout/LoginRoute.js";
import logoutRoute from "./routes/login_logout/LogoutRoute.js";
import get_salary from "./routes/admin_accessible_routes/salary_payroll/SalaryView.js";
import create_admin from "./routes/admin_accessible_routes/accounts_creation_route/CreateAdmin.js";
import teacherPayrollRoutes from "./routes/teacherPayrollRoutes.js";
// import removeTeacherRoute from './routes/admin_accessible_routes/RemoveTeacher.js'; // Commented out/Removed
import leaveManagementRoutes from './routes/leaveManagement.js';
import teacherNoticesRoutes from './routes/teacherNotices.js';
import remove_student from "./routes/admin_accessible_routes/students_data/RemoveStudent.js";
import yearEndManagementRoutes from './routes/admin_accessible_routes/yearEndManagement.js';
import calendarRoutes from './routes/calendar.js';
import studentManagementRoutes from './routes/admin_accessible_routes/students_data/StudentManagement.js';
import teacherManagementRoutes from './routes/teacherManagement.js';
import routineRoutes from './routes/routineRoutes.js';
import adminManagementRoutes from './routes/admin_accessible_routes/adminManagement.js';
import teacherStudentRouter from './routes/teacher_accessible_routes/teacher_student_list.js';
import studentPromotionRoutes from './routes/admin_accessible_routes/studentPromotion.js';
import studentDataRoutes from './routes/admin_accessible_routes/studentData.js';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import initializeDatabase from './controllers/setup/initialize-db.js';
import TeacherPayroll from './models/TeacherPayroll.js';
// Import model associations
import './models/associations.js';

// Load environment variables
configDotenv();

// Set up __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Environment variable
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Production domain configuration
const PRODUCTION_DOMAIN = process.env.PRODUCTION_DOMAIN || 'https://nawataraenglishschool.com';
const CPANEL_DOMAIN = process.env.CPANEL_DOMAIN || PRODUCTION_DOMAIN;

// Development port range configuration
const DEV_PORTS = process.env.DEV_PORTS 
  ? process.env.DEV_PORTS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180'];

// Clear console only in development
if (NODE_ENV === 'development') {
  console.clear();
}

if (NODE_ENV === 'development') {
  console.log(`Server running in ${NODE_ENV} mode`);
}

// Middlewares
app.use(express.json());

// Configure CORS for production or development
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? [PRODUCTION_DOMAIN, CPANEL_DOMAIN, 'https://www.nawataraenglishschool.com'] // In production, allow both www and non-www versions
    : DEV_PORTS, // Development ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

app.use(cookieParser()); // Restore cookie parser

// Serve static files (prefixed with /api for production)
if (NODE_ENV === 'production') {
  app.use("/api/static", express.static("public/notice_files"));
  
  // Multiple possible paths for frontend files in cPanel environment
  const possibleFrontendPaths = [
    path.join(__dirname, '../public_html'),           // If backend in nawatara, frontend in public_html
    path.join(__dirname, '../../public_html'),        // If different structure
    path.join(__dirname, '../front_end/dist'),        // If frontend dist copied to same level
    path.join(__dirname, 'dist')                      // If dist copied inside backend folder
  ];
  
  // Try to find the correct frontend path
  let frontendPath = null;
  for (const testPath of possibleFrontendPaths) {
    try {
      const indexPath = path.join(testPath, 'index.html');
      if (require('fs').existsSync(indexPath)) {
        frontendPath = testPath;
        console.log(`Frontend found at: ${frontendPath}`);
        break;
      }
    } catch (err) {
      // Continue to next path
    }
  }
  
  if (frontendPath) {
    app.use(express.static(frontendPath));
  } else {
    console.warn('Frontend files not found. Please ensure frontend dist files are uploaded.');
  }
} else {
  // In development, serve static files without prefix
  app.use(express.static("public/notice_files"));
}

// ===== REQUEST LOGGING MIDDLEWARE FOR PAYROLL (Development Only) =====
if (NODE_ENV === 'development') {
  app.use('/api/teacher-payroll', (req, res, next) => {
    console.log(`[DEBUG] REQUEST TO /api/teacher-payroll: ${req.method} ${req.originalUrl}`);
    console.log('[DEBUG] REQUEST Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[DEBUG] REQUEST Body:', JSON.stringify(req.body, null, 2)); 
    console.log('[DEBUG] REQUEST User:', req.user ? JSON.stringify(req.user, null, 2) : 'No user object');
    next();
  });
}

//routes - All API routes prefixed with /api for production deployment
app.use("/api/auth",loginRoute);  //route for login before role distribution:
app.use("/api/auth",logoutRoute)  //routes for logout
app.use("/api/getTeachers",fetch_teachers)  //route for getting all teacher's data from admin's account while viewing routines.

// Unified notice routes
app.use("/api/notices", getNotice)  // All notice-related routes under /api/notices
app.use("/api/admin/notices", admin_notice_route)  // Admin-specific notice routes
app.use("/api/teacher/notices", teacherNoticesRoutes)  // Teacher-specific notice routes

// Temporary debug route for notice issues
app.get("/api/debug/notices", async (req, res) => {
  try {
    console.log('🔍 Debug: Testing Notice model...');
    const { default: Notice } = await import('./models/Notice.js');
    const { default: Admin } = await import('./models/Admin.js');
    
    // Test simple query
    const count = await Notice.count();
    console.log(`Debug: Found ${count} notices`);
    
    const notices = await Notice.findAll({ limit: 3 });
    console.log(`Debug: Retrieved ${notices.length} notices`);
    
    res.json({
      success: true,
      count: count,
      notices: notices.map(n => ({
        id: n.id,
        title: n.title,
        adminId: n.adminId,
        forTeachers: n.forTeachers,
        forStudents: n.forStudents
      }))
    });
  } catch (error) {
    console.error('Debug notice error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/fetch",fetch_routine)  //route for routines fetch by either teacher or admin

// Make sure the old route is removed or commented
// app.use("/updateRoutine",updateRoutine)  //route for updating routine from admin's account

app.use('/api/create',create_student)  //route for creating student from admin's account
app.use("/api/create",create_teacher)  //route for creating teacher from admin's account
app.use("/api/create",create_admin)  //route for creating admin from admin's account
app.use("/api/getStudents",get_student)  //route for getting all students from admin's or teacher's account
app.use("/api/editStudent",edit_student);  //route for editing particular student from admin's account
app.use("/api/getFee",get_fee)  //route for getting student fee records from admin's account
app.use("/api/editFee",edit_record_fee)  //route for editing student fee record from admin's account
app.use("/api/fees", fixFeeRecordsRouter)  //route for fixing student fee records
app.use("/api/fetch/class",class_fee_struct)  //route for getting class fee ko structure from admin's account
// app.use("/getSalary",get_salary)  //route for getting teacher salary record from admin's account // Commenting out for payroll refresh
// Teacher Payroll Routes
app.use("/api/teacher-payroll", teacherPayrollRoutes); // Re-enabling for new payroll structure
// app.use('/admin', removeTeacherRoute); // Commented out/Removed
app.use('/api', leaveManagementRoutes);  //route for leave management
app.use('/api', teacherNoticesRoutes);
app.use("/api/remove-student", remove_student);  //route for removing students from admin's account
app.use("/api/year-end", yearEndManagementRoutes);

// Calendar routes
app.use('/api', calendarRoutes);

// Comprehensive student management routes
app.use('/api', studentManagementRoutes);

// Teacher-only student list routes (restricted access)
app.use('/api/teacher', teacherStudentRouter);

// Comprehensive teacher management routes
app.use('/api', teacherManagementRoutes);

// Comprehensive routine management routes
app.use('/api', routineRoutes);

// Admin management routes (new)
app.use('/api', adminManagementRoutes);

// Student promotion routes (new)
app.use('/api/admin/promotion', studentPromotionRoutes);

// Student data import/export routes (new)
app.use('/api/admin/student-data', studentDataRoutes);

// Serve frontend for any other routes in production (SPA support)
if (NODE_ENV === 'production') {
  // Handle client-side routing - serve index.html for non-API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    // Multiple possible paths for index.html
    const possibleIndexPaths = [
      path.join(__dirname, '../public_html/index.html'),
      path.join(__dirname, '../../public_html/index.html'),
      path.join(__dirname, '../front_end/dist/index.html'),
      path.join(__dirname, 'dist/index.html')
    ];
    
    let indexPath = null;
    for (const testPath of possibleIndexPaths) {
      try {
        if (require('fs').existsSync(testPath)) {
          indexPath = testPath;
          break;
        }
      } catch (err) {
        // Continue to next path
      }
    }
    
    if (indexPath) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not found. Please upload frontend files.');
    }
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Server error' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Connect to database and initialize it
const startServer = async () => {
  try {
    // 1. Test database connection
    await sequelize.authenticate();
    console.log('MySQL Database connection has been established successfully.');
    
    // 2. Synchronize all models with the database schema
    // Using { alter: true } temporarily for fee structure migration
    await sequelize.sync({ alter: true }); 
    console.log('Database schema synchronized with models (migration mode).');

    // 3. Initialize database with required defaults (seeding, etc.)
    try {
      await initializeDatabase(); 
      console.log('Database custom initialization completed successfully.');
    } catch (initError) {
      console.error('Database custom initialization failed:', initError);
      // Decide if this is a fatal error. For now, we'll let the server start.
    }
    
    // 4. Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server successfully running on port ${PORT}`);
      console.log(`Server URL: http://localhost:${PORT}`);
      if (NODE_ENV === 'production') {
        console.log(`Production server is ready for cPanel hosting`);
      }
    });

  } catch (error) {
    console.error('Failed to start server or connect to the database:', error);
    process.exit(1); // Exit if essential setup fails
  }
};

// Call startServer to begin the application lifecycle.
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;