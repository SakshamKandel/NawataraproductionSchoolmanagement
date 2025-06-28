import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Footer from "./components/Footer";
import { Toaster } from 'react-hot-toast';
import AIChatBox from "./components/AIChatBox";

import LoginForm from "./components/LoginForm";
import Context from "./Context";
import CreateNotice from "./components/admin_components/notice_creation/CreateNotice";
import Notice from "./components/notices/Notice";
import NoticeDiagnostic from "./components/notices/NoticeDiagnostic";
import AttachmentTest from "./components/notices/AttachmentTest";
import RoutineSee from "./components/teachers_components/routine_view/RoutineSee";
import RoutineEdit from "./components/admin_components/routine_edit/RoutineEdit";
import ClassAssignment from "./components/admin_components/routine_edit/ClassAssignment";
import ViewClassRoutine from "./components/admin_components/routine_edit/ViewClassRoutine";
import CreateAccountTeacher from "./components/admin_components/accounts_creation/CreateAccountTeacher";
import CreateAccountStudent from "./components/admin_components/accounts_creation/CreateAccountStudent";
import FetchStudents from "./components/students_data/students_profile_view/FetchStudents";
import EditStudentData from "./components/students_data/edit_profile/EditStudentData";
import ViewFee from "./components/students_data/fee_record/ViewFee";
import EditFeeRecord from "./components/students_data/fee_record/EditFeeRecord";
import TeacherPayroll from "./components/teachers_components/teachers_payroll/TeacherPayroll";
import ContactUs from "./components/ContactUs";
import CreateAccountAdmin from "./components/admin_components/accounts_creation/CreateAccountAdmin";
import MySalary from "./components/teachers_components/teachers_payroll/MySalary";
import RemoveTeacher from "./components/admin_components/RemoveTeacher";
import SubmitLeave from "./components/teachers_components/leave_management/SubmitLeave";
import ViewLeaveRequests from "./components/admin_components/leave_management/ViewLeaveRequests";
import ViewTeacherNotices from './components/admin_components/ViewTeacherNotices';
import SubmitNotice from './components/teachers_components/SubmitNotice';
import TeacherAlerts from './components/teachers_components/TeacherAlerts';
import YearEndManagement from "./components/admin_components/year_end_management/YearEndManagement";
import EnhancedCalendar from "./components/EnhancedCalendar";
import ManageFeeStructures from './components/admin_components/fee_management/ManageFeeStructures';
import ManageAdmins from './components/admin_components/ManageAdmins';
import StudentDashboard from "./components/students_data/StudentDashboard";
import TeacherStudentList from "./components/teachers_components/TeacherStudentList";
import StudentPromotion from "./components/admin_components/StudentPromotion";
import StudentDataManager from "./components/admin_components/StudentDataManager";

function Loader() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white bg-opacity-80">
      <svg
        className="animate-spin-slow h-20 w-20"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mortarboard base */}
        <rect x="12" y="32" width="40" height="8" rx="2" fill="#0a66c2" />
        {/* Mortarboard top */}
        <polygon points="32,8 60,24 32,40 4,24" fill="#0a66c2" stroke="#0a66c2" strokeWidth="2" />
        {/* Tassel */}
        <line x1="32" y1="8" x2="32" y2="48" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="48" r="3" fill="#fbbf24" />
      </svg>
      <style>{`
        .animate-spin-slow {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <Router>
      <Context>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '16px',
              marginTop: '5rem'
            }
          }} 
        />
        <Navbar />
        <main className="z-10 min-h-screen">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/about-us" element={<About />} />
            <Route exact path="/contact-us" element={<ContactUs/>}/>
            <Route exact path="/login-form" element={<LoginForm />} />
            <Route exact path="/create-notice" element={<CreateNotice />} />
            <Route exact path="/notice" element={<Notice />} />
            <Route exact path="/routine" element={<RoutineSee/>} />
            <Route exact path="/routines" element={<RoutineEdit />} />
            <Route exact path="/create-account-teacher" element={<CreateAccountTeacher />} />
            <Route exact path="/create-account-student" element={<CreateAccountStudent />} />
            <Route exact path="/create-account-admin" element={<CreateAccountAdmin/>} />
            <Route exact path="/fetch-students" element={<StudentDashboard />} />
            <Route exact path="/edit-student" element={<EditStudentData />} />
            <Route exact path="/view-fee" element={<ViewFee />} />
            <Route exact path="/edit-student-fee-record" element={<EditFeeRecord/>} />
            <Route exact path="/view-teachers-payroll" element={<TeacherPayroll/>} />
            <Route exact path="/my-salary" element={<MySalary />} />
            <Route exact path="/admin/remove-teacher" element={<RemoveTeacher />} />
            <Route exact path="/submit-leave" element={<SubmitLeave />} />
            <Route exact path="/admin/leave-requests" element={<ViewLeaveRequests />} />
            <Route exact path="/admin/teacher-notices" element={<ViewTeacherNotices />} />
            <Route exact path="/submit-notice" element={<SubmitNotice />} />
            <Route exact path="/teacher-alerts" element={<TeacherAlerts />} />
            <Route exact path="/admin/year-end-management" element={<YearEndManagement />} />
            <Route exact path="/calendar" element={<EnhancedCalendar />} />
            <Route exact path="/notice-diagnostic" element={<NoticeDiagnostic />} />
            <Route exact path="/attachment-test" element={<AttachmentTest />} />
            <Route exact path="/manage-fee-structures" element={<ManageFeeStructures />} />
            <Route exact path="/admin/manage-admins" element={<ManageAdmins />} />
            <Route exact path="/teacher-student-list" element={<TeacherStudentList />} />
            <Route exact path="/admin/student-promotion" element={<StudentPromotion />} />
            <Route exact path="/admin/student-data" element={<StudentDataManager />} />
          </Routes>
        </main>
        <AIChatBox />
        <Footer />
      </Context>
    </Router>
  );
}
