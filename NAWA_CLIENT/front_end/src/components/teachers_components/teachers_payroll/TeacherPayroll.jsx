import axios from "axios";
import React, { useEffect, useState } from "react";
import NoAccess from "../../NoAccess";
import { toast } from 'react-toastify';
import { getApiUrl } from '../../../config/api.js';
import { PDFViewer } from "@react-pdf/renderer";
import TeacherReceiptPDF from "./TeacherReceiptPDF";
import { FiAlertTriangle, FiFileText, FiX } from 'react-icons/fi';

const TeacherPayroll = () => {
  const adminLoggedIn = document.cookie.includes("adminToken");
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [btnClick, setbtnClick] = useState(false);
  const [record, setRecord] = useState([]);
  const [show, setShowMsg] = useState("Show");
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    salary: "",
    allowance: "",
    remarks: ""
  });
  const [PDF, setPDF] = useState(false);
  const [pdfData, setPdfData] = useState({});

  // State for new modals
  const [showGenerateInvoiceConfirmModal, setShowGenerateInvoiceConfirmModal] = useState(false);
  const [invoiceContext, setInvoiceContext] = useState(null); // To store { month, monthData, teacherInfo }

  const [showClearPayrollConfirmModal, setShowClearPayrollConfirmModal] = useState(false);
  // We already have selectedTeacherId for clear payroll context

  const months = [
    "Baishakh",
    "Jestha",
    "Asadhh",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
  ];
  
  useEffect(() => {
    const view_teachers_func = async () => {
      try {
        setIsLoading(true);
        const teachersData = await axios.get(
          getApiUrl('/api/teacher-payroll'),
          {
            withCredentials: true,
          }
        );
        setTeachers(teachersData.data);
        setFilteredTeachers(teachersData.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    view_teachers_func();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTeachers(teachers);
    } else {
            setFilteredTeachers(        teachers.filter(t =>          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||          (t.id ? t.id.toString().includes(searchTerm.toLowerCase()) : (t._id ? t._id.toLowerCase().includes(searchTerm.toLowerCase()) : false))        )      );
    }
  }, [searchTerm, teachers]);

  // Clear salary form and selected month when switching teachers
  useEffect(() => {
    setSalaryForm({ salary: "", allowance: "", remarks: "" });
    setSelectedMonth(null);
  }, [selectedTeacherId]);
  
  const handleViewPayments = async (id) => {
    try {
      setIsLoading(true);
      setSelectedTeacherId(id);
      setShowMsg("Hide");
      setbtnClick(true);
      
      // Reset salary form state when switching to a different teacher
      setSalaryForm({ salary: "", allowance: "", remarks: "" });
      setSelectedMonth(null);
      
      console.log("Fetching payment records for teacher ID:", id);
      const response = await axios.get(
        getApiUrl(`/api/teacher-payroll/${id}`),
        { withCredentials: true }
      );
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      console.log("Received payment data:", response.data);
      
      // Initialize default records structure
      const defaultRecords = months.reduce((acc, month) => {
        acc[month] = { 
          salary: 0, 
          allowance: 0, 
          remarks: '', 
          status: 'pending', 
          date: new Date().toISOString() 
        };
        return acc;
      }, {});

        // Merge response data with default structure to ensure all months exist
        const mergedRecords = {
          ...defaultRecords,
        ...(response.data.records || {})
        };
        
        // Ensure each month has all required fields
        Object.keys(mergedRecords).forEach(month => {
          mergedRecords[month] = {
            ...defaultRecords[month],
            ...mergedRecords[month],
            date: mergedRecords[month].date || new Date().toISOString()
          };
        });

        setRecord([{
          ...response.data,
          records: mergedRecords
        }]);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading teacher payments:", error);
      setIsLoading(false);
      
      // Show specific error message
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("Teacher not found");
        } else if (error.response.status === 500) {
          toast.error("Server error while loading teacher payments");
        } else {
          toast.error(error.response.data?.message || "Failed to load teacher payments");
        }
      } else if (error.request) {
        toast.error("Network error - please check your connection");
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }

      // Set default records even on error
      setRecord([{
        teacherId: id,
        year: new Date().getFullYear(),
        records: months.reduce((acc, month) => {
          acc[month] = { 
            salary: 0, 
            allowance: 0, 
            remarks: '', 
            status: 'pending', 
            date: new Date().toISOString() 
          };
          return acc;
        }, {})
      }]);
    }
  };

  const handleSalaryUpdate = async (month) => {
    try {
      if (!salaryForm.salary || salaryForm.salary <= 0) {
        toast.error("Please enter a valid salary amount");
        return;
      }

      setIsLoading(true);
      
      // Check if we're editing an existing paid record
      const isEditingPaidRecord = record[0]?.records[month]?.status === 'paid';
      
      const paymentData = {
        month,
        salary: parseFloat(salaryForm.salary) || 0,
        allowance: parseFloat(salaryForm.allowance) || 0,
        remarks: salaryForm.remarks,
        updatePaidRecord: isEditingPaidRecord
      };
      
      const response = await axios.put(
        getApiUrl(`/api/teacher-payroll/${selectedTeacherId}`),
        paymentData,
        { withCredentials: true }
      );
      
      if (response.data) {
        // Update local state with new data
        const updatedRecord = JSON.parse(JSON.stringify(response.data.payroll));
        setRecord([updatedRecord]);
        
        // Update the teachers list with the new data
        setTeachers(prevTeachers => {
          return prevTeachers.map(teacher => {
            if (teacher.id === selectedTeacherId || teacher._id === selectedTeacherId) {
              return {
                ...teacher,
                lastPayment: response.data.teacherInfo.lastPayment
              };
            }
            return teacher;
          });
        });

        // Reset form and selection state
      setSelectedMonth(null);
      setSalaryForm({ salary: "", allowance: "", remarks: "" });
      
        // Show success message
        toast.success("Salary updated successfully");
        }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating salary:", error);
      toast.error(error.response?.data?.message || "Failed to update salary");
    }
  };

  const confirmGenerateInvoiceAction = () => {
    if (invoiceContext) {
      const { month, monthData, teacherInfo } = invoiceContext;
      handleGenerateInvoice(month, monthData, teacherInfo);
    }
    setShowGenerateInvoiceConfirmModal(false);
    setInvoiceContext(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSalaryForm(prev => ({
      ...prev,
      [name]: name === "remarks" ? value : value === "" ? "" : parseFloat(value)
    }));
  };

  const handleClearPayroll = async () => {
    if (!selectedTeacherId) return;
    // Show custom confirmation modal instead of window.confirm
    setShowClearPayrollConfirmModal(true);
  };

  const confirmClearPayrollAction = async () => {
    if (!selectedTeacherId) return;
    
    try {
      setIsLoading(true);
      const response = await axios.post(
        getApiUrl('/api/teacher-payroll/clear'), 
        { teacherId: selectedTeacherId }, 
        { withCredentials: true }
      );
      
      toast.success('Payroll records cleared successfully!');
      
      // Update the UI to reflect the changes
      setRecord([]);
      
      // Update the teacher in the teachers list
      setTeachers(prevTeachers => {
        return prevTeachers.map(teacher => {
          if (teacher.id === selectedTeacherId || teacher._id === selectedTeacherId) {
            return {
              ...teacher,
              lastPayment: null
            };
          }
          return teacher;
        });
      });
      
      // Close the record view
      setbtnClick(false);
      setShowMsg("Show");
      setIsLoading(false);
      
      // Refresh the data
      setTimeout(() => {
        const view_teachers_func = async () => {
          try {
            const teachersData = await axios.get(
              getApiUrl('/api/teacher-payroll'),
              { withCredentials: true }
            );
            setTeachers(teachersData.data);
            setFilteredTeachers(teachersData.data);
          } catch (error) {
            console.error("Error refreshing teachers data:", error);
          }
        };
        view_teachers_func();
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      console.error("Error clearing payroll:", error);
      toast.error(error.response?.data?.message || 'Failed to clear payroll records');
    }
    setShowClearPayrollConfirmModal(false);
  };

  // Generate invoice for a specific month's salary payment
  const handleGenerateInvoice = (month, monthData, teacherData) => {
    try {
      if (!monthData || !teacherData) {
        console.error("Missing data for PDF generation");
        toast.error("Cannot generate invoice: Missing data");
        return;
      }

      // Ensure all required data is present
      const pdfData = {
        month,
        teacherName: teacherData.name || 'Unknown',
        teacherId: teacherData.id || teacherData._id || 'Unknown',
        position: teacherData.position || 'Teacher',
        salary: monthData.salary || 0,
        allowance: monthData.allowance || 0,
        total: (monthData.salary || 0) + (monthData.allowance || 0),
        date: monthData.date || new Date().toISOString(),
        remarks: monthData.remarks || '',
        status: monthData.status || 'pending'
      };

      setPdfData(pdfData);
      setPDF(true);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    }
  };

  // Add PDF viewer component with error boundary
  const PDFViewerWrapper = () => {
    try {
      return (
        <div style={{ height: '100vh', width: '100%' }}>
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            <TeacherReceiptPDF data={pdfData} />
          </PDFViewer>
        </div>
      );
    } catch (error) {
      console.error("Error rendering PDF:", error);
      return (
        <div className="error-container">
          <h3>Error generating PDF</h3>
          <p>Please try again or contact support if the issue persists.</p>
        </div>
      );
    }
  };

  // Update the PDF modal render
  const renderPDFModal = () => {
    if (!PDF) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content pdf-modal">
          <div className="modal-header">
            <h2>Salary Receipt</h2>
            <button onClick={() => setPDF(false)} className="close-button">
              <FiX />
            </button>
          </div>
          <div className="modal-body">
            <PDFViewerWrapper />
          </div>
        </div>
      </div>
    );
  };

  // Add a function to verify the record display
  const verifyDisplayedRecords = () => {
    if (!record || record.length === 0) {
      console.log("No records to verify");
      return false;
    }

    const currentRecords = record[0]?.records;
    console.log("Currently displayed records:", currentRecords);

    if (!currentRecords) {
      console.log("No records object found");
      return false;
    }

    // Verify each month has required fields
    const requiredFields = ['salary', 'allowance', 'remarks', 'status', 'date'];
    const isValid = months.every(month => {
      const monthData = currentRecords[month];
      if (!monthData) {
        console.log(`Missing data for month: ${month}`);
        return false;
      }
      return requiredFields.every(field => monthData[field] !== undefined);
    });

    if (!isValid) {
      console.log("Invalid record structure detected");
      // Attempt to fix the structure
      const fixedRecords = months.reduce((acc, month) => {
        acc[month] = {
          salary: currentRecords[month]?.salary || 0,
          allowance: currentRecords[month]?.allowance || 0,
          remarks: currentRecords[month]?.remarks || '',
          status: currentRecords[month]?.status || 'pending',
          date: currentRecords[month]?.date || new Date().toISOString()
        };
        return acc;
      }, {});

      setRecord([{
        ...record[0],
        records: fixedRecords
      }]);
      return true;
    }

    return true;
  };

  // Enhanced refresh function
  const refreshData = async () => {
    if (selectedTeacherId) {
      try {
        console.log("Refreshing data for teacher ID:", selectedTeacherId);
        const response = await axios.get(
          getApiUrl(`/api/teacher-payroll/${selectedTeacherId}`),
          { withCredentials: true }
        );
        
        console.log("Received refresh data:", response.data);
        if (response.data && response.data.records) {
          console.log("Updating displayed records with fresh data");
          setRecord([JSON.parse(JSON.stringify(response.data))]);
        } else {
          console.warn("Received empty or invalid data during refresh");
        }
        
        // Also refresh the teachers list to get updated info
        const teachersData = await axios.get(
          getApiUrl('/api/teacher-payroll'),
          { withCredentials: true }
        );
        console.log("Refreshed teachers list data");
        setTeachers(teachersData.data);
        setFilteredTeachers(prev => {
          if (!searchTerm) return teachersData.data;
          return teachersData.data.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.id ? t.id.toString().includes(searchTerm.toLowerCase()) : 
            (t._id ? t._id.toLowerCase().includes(searchTerm.toLowerCase()) : false))
          );
        });
        
        // Verify our displayed records are correct
        verifyDisplayedRecords();
      } catch (error) {
        console.error("Error refreshing data:", error);
        // Don't show toast for background refresh errors
      }
    }
  };

  // Effect to reload data when component mounts or when the URL changes
  useEffect(() => {
    // If there's a previously selected teacher, reload their data
    if (selectedTeacherId) {
      console.log("Component re-rendered, reloading data for teacher:", selectedTeacherId);
      handleViewPayments(selectedTeacherId);
    }
  }, []);  // Empty dependency array means this runs once on mount

  // Set up more frequent data refresh (every 15 seconds)
  useEffect(() => {
    const intervalId = setInterval(refreshData, 15000);
    return () => clearInterval(intervalId);
  }, [selectedTeacherId, searchTerm]);
  
  return adminLoggedIn ? (
    <div className="min-h-screen bg-[#f3f6f8] font-system-ui py-6">
      <div className="max-w-[1128px] mx-auto px-4">
        {!PDF ? (
          <>
            {/* LinkedIn-style Header */}
            <div className="bg-white shadow rounded-lg p-6 mb-4">
              <h1 className="text-[#000000E6] text-2xl font-medium leading-[1.25]">Teacher Payroll Management</h1>
              <p className="mt-1 text-[#00000099] text-base">Manage and track salary records for teaching staff</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Teacher Selection Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-[#00000014]">
                    <h2 className="text-[#000000E6] text-lg font-medium">Select Teacher</h2>
                    <p className="text-[#00000099] text-sm mt-1">Choose a teacher to view payment history</p>
                  </div>

                  {/* Search Bar */}
                  <div className="p-4 border-b border-[#00000014]">
                    <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-[#00000099] focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] text-[#000000E6] placeholder-[#00000099] bg-white"
                    />
                      <svg className="absolute right-3 top-2.5 h-5 w-5 text-[#00000099]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                  </div>
                  </div>

                  {/* Teachers List */}
                  <div className="overflow-y-auto max-h-[600px]">
                      {filteredTeachers && filteredTeachers.length > 0 ? (
                      <div className="divide-y divide-[#00000014]">
                        {filteredTeachers.map((teacher) => (
                          <button
                            key={teacher.id || teacher._id}
                            onClick={() => handleViewPayments(teacher.id || teacher._id)}
                            className={`w-full text-left p-4 hover:bg-[#f3f6f8] transition-colors duration-200 flex items-center gap-3
                              ${(teacher.id || teacher._id) === selectedTeacherId ? 'bg-[#f3f6f8]' : ''}`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-medium
                              ${(teacher.id || teacher._id) === selectedTeacherId 
                                ? 'bg-[#0a66c2] text-white' 
                                : 'bg-[#f3f6f8] text-[#0a66c2]'}`}>
                              {teacher.name.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-medium ${(teacher.id || teacher._id) === selectedTeacherId ? 'text-[#0a66c2]' : 'text-[#000000E6]'}`}>
                                {teacher.name}
                              </p>
                              <p className="text-sm text-[#00000099]">ID: {teacher.id || teacher._id}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      ) : (
                      <div className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-[#f3f6f8] flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-[#00000099]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <p className="text-[#00000099]">No teachers found</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Payment Records Panel */}
              <div className="lg:col-span-2">
                {btnClick ? (
                  <div className="bg-white rounded-lg shadow">
                    {/* Header */}
                    <div className="p-4 border-b border-[#00000014] flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <h2 className="text-[#000000E6] text-lg font-medium">Payment Records</h2>
                        <p className="text-[#00000099] text-sm">
                          {teachers.find(t => t._id === selectedTeacherId)?.name || "Teacher"}'s monthly salary history
                        </p>
                      </div>
                      <div className="flex gap-2">
                      <button
                        onClick={handleClearPayroll}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dc2626] transition-colors"
                      >
                          Clear Records
                      </button>
                      <button 
                        onClick={() => {
                          setbtnClick(false);
                          setShowMsg("Show");
                        }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#000000E6] bg-white border border-[#00000099] hover:bg-[#f3f6f8] rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                      >
                        Back
                      </button>
                      </div>
                    </div>
                    
                    {/* Records Grid */}
                    <div className="p-4">
                    {(!record || record.length === 0) ? (
                        <div className="text-center py-8">
                          <div className="mx-auto w-16 h-16 rounded-full bg-[#f3f6f8] flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[#00000099]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                          </div>
                          <h3 className="text-[#000000E6] text-lg font-medium">No payment records found</h3>
                          <p className="text-[#00000099] mt-1">No salary records are available for this teacher yet.</p>
                      </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {record && months.map((month) => {
                          const monthData = record[0]?.records[month];
                            const totalSalary = monthData ? monthData.salary + monthData.allowance : 0;
                          
                          return (
                              <div key={month} className="bg-white border border-[#00000014] rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                {/* Month Header */}
                                <div className="p-4 bg-[#f3f6f8] border-b border-[#00000014] flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                    <span className="font-medium text-[#000000E6]">{month}</span>
                                  </div>
                                {monthData?.status === 'paid' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#057642] text-white">
                                    Paid
                                  </span>
                                ) : (
                                  selectedMonth === month ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0a66c2] text-white">
                                      Editing
                                    </span>
                                  ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00000099] text-white">
                                      Pending
                                    </span>
                                  )
                                )}
                              </div>
                              
                                <div className="p-4">
                                {selectedMonth === month ? (
                                  /* Salary Edit Form */
                                  <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#000000E6] mb-1">
                                        Salary Amount
                                      </label>
                                        <div className="relative">
                                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#00000099]">
                                            Rs.
                                          </span>
                                        <input
                                          type="number"
                                          name="salary"
                                          value={salaryForm.salary}
                                          onChange={handleInputChange}
                                            className="block w-full pl-12 pr-4 py-2 border border-[#00000099] rounded-lg focus:ring-[#0a66c2] focus:border-[#0a66c2] text-[#000000E6]"
                                          placeholder="0.00"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[#000000E6] mb-1">
                                        Allowance
                                      </label>
                                        <div className="relative">
                                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#00000099]">
                                            Rs.
                                          </span>
                                        <input
                                          type="number"
                                          name="allowance"
                                          value={salaryForm.allowance}
                                          onChange={handleInputChange}
                                            className="block w-full pl-12 pr-4 py-2 border border-[#00000099] rounded-lg focus:ring-[#0a66c2] focus:border-[#0a66c2] text-[#000000E6]"
                                          placeholder="0.00"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[#000000E6] mb-1">
                                        Remarks
                                      </label>
                                      <textarea
                                        name="remarks"
                                        value={salaryForm.remarks}
                                        onChange={handleInputChange}
                                        rows="2"
                                          className="block w-full px-4 py-2 border border-[#00000099] rounded-lg focus:ring-[#0a66c2] focus:border-[#0a66c2] text-[#000000E6]"
                                        placeholder="Optional remarks"
                                      ></textarea>
                                    </div>
                                    
                                      <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSalaryUpdate(month)}
                                        disabled={isLoading}
                                          className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors disabled:opacity-50"
                                      >
                                        {isLoading ? 'Saving...' : 'Save Payment'}
                                      </button>
                                      <button
                                        onClick={() => setSelectedMonth(null)}
                                          className="px-4 py-2 text-sm font-medium text-[#000000E6] bg-white border border-[#00000099] hover:bg-[#f3f6f8] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Salary Display */
                                  <div>
                                    {monthData?.status === 'paid' ? (
                                      <>
                                          <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                              <span className="text-[#00000099]">Base Salary</span>
                                              <span className="text-[#000000E6] font-medium">Rs. {monthData.salary.toLocaleString()}</span>
                                          </div>
                                          
                                          {monthData.allowance > 0 && (
                                              <div className="flex justify-between items-center">
                                                <span className="text-[#00000099]">Allowance</span>
                                                <span className="text-[#000000E6] font-medium">Rs. {monthData.allowance.toLocaleString()}</span>
                                            </div>
                                          )}
                                          
                                            <div className="pt-3 border-t border-[#00000014] flex justify-between items-center">
                                              <span className="text-[#000000E6] font-medium">Total</span>
                                              <span className="text-[#0a66c2] font-semibold">Rs. {totalSalary.toLocaleString()}</span>
                                          </div>
                                          
                                          {monthData.remarks && (
                                              <div className="pt-3">
                                                <span className="text-[#00000099] block mb-1">Remarks</span>
                                                <p className="text-[#000000E6] italic">"{monthData.remarks}"</p>
                                            </div>
                                          )}
                                          
                                            <div className="pt-3">
                                              <span className="text-[#00000099] block mb-1">Payment Date</span>
                                              <p className="text-[#000000E6]">{new Date(monthData.date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}</p>
                                          </div>
                                        </div>
                                        
                                          <div className="mt-4 space-y-2">
                                        <button
                                          onClick={() => handleGenerateInvoice(month, monthData, teachers.find(t => t.id === selectedTeacherId || t._id === selectedTeacherId))}
                                              className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                                        >
                                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                          </svg>
                                          Generate Salary Invoice
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            setSelectedMonth(month);
                                            setSalaryForm({
                                              salary: monthData.salary.toString(),
                                              allowance: monthData.allowance.toString(),
                                              remarks: monthData.remarks || ""
                                            });
                                          }}
                                              className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-[#000000E6] bg-white border border-[#00000099] hover:bg-[#f3f6f8] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                                        >
                                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          Edit Salary Details
                                        </button>
                                          </div>
                                      </>
                                    ) : (
                                        <div className="text-center py-6">
                                        <button
                                          onClick={() => setSelectedMonth(month)}
                                            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                          </svg>
                                          Add Payment
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center h-full flex flex-col justify-center items-center">
                    <div className="w-20 h-20 rounded-full bg-[#f3f6f8] flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    </div>
                    <h3 className="text-[#000000E6] text-xl font-medium mb-2">Teacher Payment Records</h3>
                    <p className="text-[#00000099] max-w-md">Select a teacher from the list to view their payment history and manage their monthly salary records.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          renderPDFModal()
        )}

        {/* Confirmation Modals */}
        {showGenerateInvoiceConfirmModal && invoiceContext && (
          <div className="fixed inset-0 bg-[#000000A6] backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start">
                <FiFileText className="text-2xl text-[#0a66c2] mr-3 mt-1" />
                <div>
                  <h3 className="text-[#000000E6] text-lg font-medium">Generate Invoice?</h3>
                  <p className="text-[#00000099] mt-1">
                    Payment saved successfully! Would you like to generate an invoice for {invoiceContext.month}?
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowGenerateInvoiceConfirmModal(false);
                    setInvoiceContext(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#000000E6] bg-white border border-[#00000099] hover:bg-[#f3f6f8] rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmGenerateInvoiceAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0a66c2] hover:bg-[#004182] rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Yes, Generate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showClearPayrollConfirmModal && (
          <div className="fixed inset-0 bg-[#000000A6] backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start">
                <FiAlertTriangle className="text-2xl text-[#dc2626] mr-3 mt-1" />
                <div>
                  <h3 className="text-[#000000E6] text-lg font-medium">Confirm Clear Payroll</h3>
                  <p className="text-[#00000099] mt-1">
                    Are you sure you want to clear all payroll records for this teacher? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowClearPayrollConfirmModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#000000E6] bg-white border border-[#00000099] hover:bg-[#f3f6f8] rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearPayrollAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dc2626] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Clearing...' : 'Yes, Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <NoAccess/>
  );
};

export default TeacherPayroll;