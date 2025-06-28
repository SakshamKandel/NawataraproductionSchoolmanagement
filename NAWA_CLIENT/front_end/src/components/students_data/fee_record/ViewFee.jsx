import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NoAccess from "../../NoAccess";
import axios from "axios";
import { PDFViewer } from "@react-pdf/renderer";
import ReceiptPDF from "./ReceiptPDF";
import { toast } from 'react-toastify';
import { getApiUrl } from '../../../config/api.js';

const ViewFee = () => {
  const navigate=useNavigate();
  const location = useLocation();
  const [record, setRecord] = useState([]);
  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [payed, setPayed] = useState(0);
  const [due,setDue]=useState(0);
  const [PDF,setPDF]=useState(false);
  const [pdfdata,setpdfdata]=useState({});

  useEffect(() => {
    const studentInfo = location.state?.student;
    const studentIdFromState = studentInfo?._id || studentInfo?.id;
    
    // Check if we need to auto-show receipt from a redirect
    if (location.state?.showReceiptForMonth && location.state?.receiptData && studentInfo) {
      setpdfdata(location.state.receiptData);
      setPDF(true);
      // Clean up the state to prevent re-triggering on refresh/back
      navigate(location.pathname, { state: { ...location.state, showReceiptForMonth: false, receiptData: null }, replace: true });
    }

    const fetchRecord = async () => {
      setLoading(true);
      try {
        // Get student fee record
        const response = await axios.get(
          getApiUrl(`/getFee/${studentIdFromState}`),
          { withCredentials: true }
        );
        setRecord(response.data);
        
        // Calculate total paid amount across all months
        let total = 0;
        months.forEach((month) => {
          if (response.data[0]?.records && response.data[0].records[month]) {
            total += 
              (response.data[0].records[month].adm_fee || 0) +
              (response.data[0].records[month].month_fee || 0) +
              (response.data[0].records[month].comp_fee || 0);
          }
        });
        setPayed(total);
        
        // Try to get class fee structure
        if (studentInfo) { // Check if studentInfo is available
          try {
            const classId = studentInfo.class_name || studentInfo.grade;
            const amountResponse = await axios.get(
              getApiUrl(`/fetch/class/structure/fees/${classId}`),
              { withCredentials: true }
            );
            setFeeStructure(amountResponse.data);
            
            // Calculate due amount based on fee structure
            const totalFees = (amountResponse.data.admissionFee || 0) + 
                            ((amountResponse.data.monthlyFee || 0) * 12) + 
                            ((amountResponse.data.computerFee || 0) * 12);
            setDue(totalFees - total);
          } catch (feeError) {
            console.error("Error fetching class fee structure:", feeError);
            toast.error("Could not fetch fee structure for this class. Please create one first.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        if (error.response) {
          toast.error(error.response.data.message || error.response.data);
        } else {
          toast.error(error.message || "Failed to fetch student fee information");
        }
      } finally {
        setLoading(false);
      }
    };

    if (studentIdFromState && !location.state?.showReceiptForMonth) { // Don't refetch if just showing receipt
      fetchRecord();
    } else if (!studentIdFromState && !location.state?.showReceiptForMonth) {
      toast.error("No student information provided");
      setLoading(false);
      // navigate(-1); // Consider if navigation is appropriate if studentInfo is missing
    } else if (!studentInfo && location.state?.showReceiptForMonth) {
        toast.error("Student details missing for receipt. Please go back and try again.");
        setLoading(false);
    }

  }, [location.state, navigate]); // Added navigate to dependency array

  const handleAmountFunc = async(month) => {
    try {
      const studentId = location.state?.student._id || location.state?.student.id;
      const studentClassName = location.state?.student.class_name || location.state?.student.grade;
      navigate("/edit-student-fee-record", {
        state: {
          month: month,
          id: studentId,
          className: studentClassName,
          student: location.state.student // Pass the full student object
        }
      });
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error(error.message || "Failed to navigate to fee edit page");
    }
  }
  
  return location.state ? (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6 lg:px-8">
      {!PDF ? (
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Fee Records</h1>
            <p className="text-gray-600 mt-1">
              Student: <span className="font-medium">{location.state.student.name}</span> | Class: <span className="font-medium">{location.state.student.class_name}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Information Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#0a66c2] px-6 py-4">
                  <h2 className="text-white text-lg font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Student Information
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{location.state.student.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium text-gray-900">{location.state.student.class_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{location.state.student.address}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Parent Information</p>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Father's Name</p>
                          <p className="font-medium text-gray-900">{location.state.student.fatherName}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Father's Phone</p>
                          <p className="font-medium text-gray-900 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {location.state.student.fatherPhone}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Mother's Name</p>
                          <p className="font-medium text-gray-900">{location.state.student.motherName}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Mother's Phone</p>
                          <p className="font-medium text-gray-900 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {location.state.student.motherPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fee Records Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#0a66c2] px-6 py-4">
                  <h2 className="text-white text-lg font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Payment Records
                  </h2>
                </div>
                
                <div className="p-6">
                  {record.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {months.map((month) =>
                          record.map((rec) => {
                            const totalMonth =
                              (rec.records[month].adm_fee || 0) +
                              (rec.records[month].month_fee || 0) +
                              (rec.records[month].comp_fee || 0);
                            return (
                              <div
                                key={month}
                                className="w-full flex flex-wrap md:flex-nowrap justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100"
                              >
                                <div className="w-full md:w-auto mb-3 md:mb-0">
                                  <span className="text-sm text-gray-500">Month</span>
                                  <p className="font-medium text-gray-900">{month}</p>
                                </div>
                                
                                <div className="w-full md:w-auto mb-3 md:mb-0 md:ml-4">
                                  <span className="text-sm text-gray-500">Amount</span>
                                  <p className="font-medium text-gray-900">
                                    {totalMonth > 0 ? `Rs. ${totalMonth}` : "No payment"}
                                  </p>
                                </div>
                                
                                <div className="w-full md:w-auto flex gap-2 justify-end">
                                  <button 
                                    onClick={() => handleAmountFunc(month)} 
                                    className="text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:ring-2 focus:outline-none focus:ring-gray-100 font-medium rounded-full text-sm px-4 py-1.5 text-center inline-flex items-center shadow-sm transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {totalMonth > 0 ? "Edit" : "Add"}
                                  </button>
                                  {totalMonth > 0 && (
                                    <button 
                                      onClick={() => {
                                        setPDF(true);
                                        setpdfdata({
                                          month: month,
                                          adm_fee: rec.records[month].adm_fee || 0,
                                          month_fee: rec.records[month].month_fee || 0,
                                          comp_fee: rec.records[month].comp_fee || 0,
                                          total: totalMonth
                                        });
                                      }}
                                      className="text-white bg-[#0a66c2] hover:bg-[#004182] focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-1.5 text-center inline-flex items-center shadow-sm transition-colors duration-200"
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                      </svg>
                                      Receipt
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Fee Structure Information */}
                      {feeStructure && (
                        <div className="mt-6 mb-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Class Fee Structure
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500">Admission Fee</p>
                                <p className="text-blue-700 font-semibold">Rs. {feeStructure.admissionFee}</p>
                                <p className="text-xs text-gray-500 mt-1">(one-time)</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500">Monthly Fee</p>
                                <p className="text-blue-700 font-semibold">Rs. {feeStructure.monthlyFee}</p>
                                <p className="text-xs text-gray-500 mt-1">(per month)</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-xs text-gray-500">Computer Fee</p>
                                <p className="text-blue-700 font-semibold">Rs. {feeStructure.computerFee}</p>
                                <p className="text-xs text-gray-500 mt-1">(per month)</p>
                              </div>
                            </div>
                            <div className="mt-3 bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xs text-gray-500">Total Yearly Fees</p>
                                  <p className="text-blue-700 font-semibold">
                                    Rs. {feeStructure.admissionFee + (feeStructure.monthlyFee * 12) + (feeStructure.computerFee * 12)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Due Amount</p>
                                  <p className="text-red-600 font-semibold">Rs. {due}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div className="mt-8">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <div className="flex items-center">
                            <div className="bg-green-100 rounded-full p-2 mr-3">
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-green-500">Amount Paid</p>
                              <p className="font-bold text-green-700 text-lg">Rs. {payed}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No payment records</h3>
                      <p className="mt-1 text-sm text-gray-500">There are no payment records available for this student.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Link to="/fetch-students">
              <button className="text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:ring-2 focus:outline-none focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 text-center inline-flex items-center shadow-sm transition-colors duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Students
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-[#0a66c2] text-white flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-xl font-semibold">Receipt Preview</h2>
            <button 
              onClick={() => {setPDF(false); setpdfdata({});}}
              className="text-white bg-[#004182] hover:bg-[#003166] focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center shadow-md transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Fee Records
            </button>
          </div>
          
          <div className="h-[calc(100vh-140px)] bg-gray-100 border-t border-gray-200"> {/* Adjusted height for header */}
            {(() => {
              const studentForReceipt = location.state?.student;
              console.log("Student data being passed to ReceiptPDF:", studentForReceipt);
              if (!studentForReceipt) {
                return <p className="text-red-500 p-4 text-center">Error: Student data is missing for the receipt. Please return and try again.</p>;
              }
              if (!pdfdata || Object.keys(pdfdata).length === 0) {
                return <p className="text-red-500 p-4 text-center">Error: PDF data (fee details) is missing for the receipt. Please return and try again.</p>;
              }
              return (
                <PDFViewer style={{width:"100%", height:"100%"}}>
                  <ReceiptPDF studentData={studentForReceipt} pdfdata={pdfdata} />
                </PDFViewer>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  ) : (
    <NoAccess />
  );
};

export default ViewFee;