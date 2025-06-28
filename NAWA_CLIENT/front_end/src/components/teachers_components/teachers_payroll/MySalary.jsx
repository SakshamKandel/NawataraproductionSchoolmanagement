import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { getApiUrl } from '../../../config/api.js';

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

const MySalary = () => {
  const [salaryRecord, setSalaryRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);

  useEffect(() => {
    // Check if teacher is logged in
    const checkAuth = () => {
      const isTeacher = document.cookie.includes("teacherToken");
      setIsTeacherLoggedIn(isTeacher);
      return isTeacher;
    };

    const fetchSalary = async () => {
      if (!checkAuth()) {
        setError("Please log in as a teacher to view salary information");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      
      try {
        console.log("Fetching salary data...");
        const res = await axios.get(
          getApiUrl('/api/teacher-payroll/mine'), 
          { withCredentials: true }
        );
        
        console.log("Salary data received:", res.data);
        setSalaryRecord(res.data);
        
        if (res.data) {
          toast.success("Salary records loaded successfully");
        } else {
          toast.info("No salary records found");
        }
      } catch (err) {
        console.error("Error fetching salary:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to load salary data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalary();
  }, []);

  if (!isTeacherLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] font-sans py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-red-800">Access Denied</h3>
            <p className="mt-2 text-gray-600">Please log in as a teacher to view your salary information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-[#191919]">My Salary Records</h1>
          <p className="text-[#666666] mt-1">View your monthly salary and allowance details</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0a66c2]"></div>
              <p className="mt-4 text-[#666666]">Loading salary data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-3 text-lg font-medium text-[#191919]">{error}</h3>
              <p className="mt-2 text-gray-500">Please try again later or contact the administrator.</p>
            </div>
          ) : salaryRecord ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {months.map((month) => {
                const monthData = salaryRecord.records?.[month];
                const totalSalary = monthData ? 
                  parseFloat(monthData.salary || 0) + parseFloat(monthData.allowance || 0) : 0;
                
                return (
                  <div key={month} className="border border-[#e0e0e0] rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className="px-4 py-3 border-b border-[#e0e0e0] flex justify-between items-center bg-[#f8f8f8]">
                      <span className="font-medium text-[#191919]">{month}</span>
                      {monthData?.status === 'paid' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#e0f7e9] text-[#0a8a43]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0a8a43] mr-1.5"></span>
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#fff3cd] text-[#b8860b]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b8860b] mr-1.5"></span>
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-3">
                        <p className="text-sm text-[#666666]">Total Amount</p>
                        <p className="text-xl font-semibold text-[#191919] mt-1">
                          {totalSalary > 0 ? `Rs. ${totalSalary.toLocaleString()}` : 'Not Processed'}
                        </p>
                      </div>
                      
                      {monthData?.status === 'paid' && (
                        <>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-[#666666]">Base Salary:</span>
                            <span className="text-sm font-medium">Rs. {parseFloat(monthData.salary || 0).toLocaleString()}</span>
                          </div>
                          {monthData.allowance > 0 && (
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-[#666666]">Allowance:</span>
                              <span className="text-sm font-medium">Rs. {parseFloat(monthData.allowance || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {monthData?.remarks && (
                        <div className="bg-[#f3f2ef] p-2 rounded text-sm text-[#666666] mt-2">
                          <span className="font-medium text-[#191919]">Remarks:</span> {monthData.remarks}
                        </div>
                      )}
                      
                      {monthData?.date && (
                        <div className="mt-2 text-xs text-[#666666]">
                          Payment Date: {new Date(monthData.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-3 text-lg font-medium text-[#191919]">No salary records found</h3>
              <p className="mt-1 text-gray-500">Your salary information has not been processed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySalary;