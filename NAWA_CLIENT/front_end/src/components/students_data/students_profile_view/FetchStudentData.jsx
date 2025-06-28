import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from "axios";
import { getApiUrl } from '../../../config/api.js';
import { FiX, FiUser, FiUsers, FiCalendar, FiPhone, FiMail, FiMapPin, FiEdit2, FiTrash2, FiDollarSign, FiBriefcase, FiAward, FiAlertTriangle, FiBook, FiBookmark, FiHome } from "react-icons/fi";

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start py-2">
    <div className="flex-shrink-0 w-8 h-8 inline-flex items-center justify-center text-blue-600">
      {React.createElement(icon, { className: "h-5 w-5" })}
    </div>
    <div className="ml-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "N/A"}</p>
    </div>
  </div>
);

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center pb-3 mb-3 border-b border-gray-200">
    {React.createElement(icon, { className: "h-5 w-5 text-blue-600 mr-2.5" })}
    <h3 className="text-md font-semibold text-gray-700">{title}</h3>
  </div>
);

const FetchStudentData = (props) => {
  const adminLoggedIn = document.cookie.includes("adminToken");
  const navigate = useNavigate();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [confirmStep, setConfirmStep] = useState(1);

  const { student, onClose } = props;

  const handleEditFunc = () => {
    navigate("/edit-details", { state: { student } });
    onClose();
  };

  const handleViewFeeFunc = () => {
    navigate("/view-fee", { state: { student } });
    onClose();
  };

  const triggerRemoveStudent = () => {
    setShowRemoveModal(true);
    setConfirmStep(1);
  };

  const confirmRemoveStudentAction = async () => {
      if (confirmStep === 1) {
        setConfirmStep(2);
        return;
      }

    try {
      const response = await axios.delete(
        getApiUrl(`/remove-student/${student.id || student._id}`),
        { withCredentials: true }
      );
      toast.success(response.data.message);
      resetRemoveModal();
      onClose();
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete student.");
      resetRemoveModal();
    }
  };

  const resetRemoveModal = () => {
    setShowRemoveModal(false);
    setConfirmStep(1);
  };

  if (!student) return null;

  return (
    <>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white rounded-t-xl px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-800">Student Profile</h2>
                  <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
            aria-label="Close profile"
          >
            <FiX className="h-6 w-6" />
                  </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 mb-6">
            <div className="flex-shrink-0 w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
              {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-sm text-gray-600">
                Class: {student.class_name || student.grade || "N/A"} 
                {student.section && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                    Section {student.section}
                  </span>
                )}
                {student.roll_no && <span className="ml-2">| Roll No: {student.roll_no}</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">Student ID: {student.id || student._id || "N/A"}</p>
            </div>
          </div>
          
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <SectionTitle icon={FiUser} title="Student Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <DetailItem icon={FiBook} label="Student's Name" value={student.name} />
              <DetailItem icon={FiBookmark} label="Class" value={`Class ${student.grade}`} />
              {student.section && (
                <DetailItem icon={FiUsers} label="Section" value={`Section ${student.section}`} />
              )}
            </div>
          </div>
          
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 mt-4">
            <SectionTitle icon={FiUsers} title="Parent Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <DetailItem icon={FiUser} label="Father's Name" value={student.fatherName} />
                  <DetailItem icon={FiPhone} label="Father's Phone" value={student.fatherPhone} />
                  <DetailItem icon={FiUser} label="Mother's Name" value={student.motherName} />
                  <DetailItem icon={FiPhone} label="Mother's Phone" value={student.motherPhone} />
                </div>
              </div>

          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 mt-4">
            <SectionTitle icon={FiMapPin} title="Contact Information" />
            <div className="grid grid-cols-1 gap-x-6">
              <DetailItem icon={FiHome} label="Home Address" value={student.address} />
              <DetailItem icon={FiMail} label="Email" value={student.email} />
            </div>
          </div>
        </div>
        
            {adminLoggedIn && (
          <div className="sticky bottom-0 bg-white rounded-b-xl px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-3 z-10">
                <button
                  onClick={handleEditFunc}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FiEdit2 className="h-4 w-4 mr-2" />
              Edit Profile
                </button>
            <button
              onClick={handleViewFeeFunc}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FiDollarSign className="h-4 w-4 mr-2" />
              View Fees
            </button>
            <button
              onClick={triggerRemoveStudent}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <FiTrash2 className="h-4 w-4 mr-2" />
              Delete Student
            </button>
          </div>
        )}
      </div>

      {showRemoveModal && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FiAlertTriangle className="h-7 w-7 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                {confirmStep === 1 ? "Warning: Student Removal" : "Final Confirmation"}
              </h3>
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  {confirmStep === 1 
                    ? <>You are about to remove <strong>{student.name}</strong>. This action will delete all associated data (info, fees) and cannot be undone.</>
                    : <>Are you absolutely sure you want to remove <strong>{student.name}</strong>? This is irreversible.</>
                  }
                </p>
                 {confirmStep === 1 && (
                    <ul className="text-left mt-3 list-disc list-inside text-sm text-gray-500 bg-red-50 p-3 rounded-md">
                        <li>All student information will be deleted.</li>
                        <li>All fee records will be removed.</li>
                        <li>This action <strong className="text-red-700">CANNOT</strong> be undone.</li>
                    </ul>
                 )}
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={confirmRemoveStudentAction}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                {confirmStep === 1 ? "Proceed to Confirm" : "Yes, Delete Student"}
              </button>
              <button
                type="button"
                onClick={resetRemoveModal}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
    </div>
      )}
    </>
  );
};

export default FetchStudentData;