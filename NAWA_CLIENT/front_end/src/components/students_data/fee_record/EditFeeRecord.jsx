import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NoAccess from "../../NoAccess";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from 'react-toastify';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getApiUrl } from '../../../config/api.js';

const schema = yup.object({
  month_fee: yup.number().min(0).required(),
  transportation_fee: yup.number().min(0).required(),
  exam_fee: yup.number().min(0).required(),
});

const EditFeeRecord = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      month_fee: 0,
      transportation_fee: 0,
      exam_fee: 0,
    },
  });
  const location = useLocation();
  const [record, setRecord] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        // Fetch student fee record
        const response = await axios.get(
          getApiUrl(`/getFee/${location.state?.id}`),
          { withCredentials: true }
        );
        
        setRecord(response.data);
        
        // Set form values from record
        if (response.data && response.data[0]?.records && response.data[0].records[location.state.month]) {
          setValue("month_fee", response.data[0].records[location.state.month].month_fee);
          setValue("transportation_fee", response.data[0].records[location.state.month].transportation_fee);
          setValue("exam_fee", response.data[0].records[location.state.month].exam_fee);
        }
        
        // Get class fee structure for reference
        if (location.state?.className) {
          try {
            const feeResponse = await axios.get(
              getApiUrl(`/fetch/class/structure/fees/${location.state.className}`),
              { withCredentials: true }
            );
            setFeeStructure(feeResponse.data);
          } catch (feeError) {
            console.error("Error fetching fee structure:", feeError);
            toast.error("Could not fetch fee structure for this class. Using default values.");
          }
        }
      } catch (error) {
        console.error("Error fetching fee record:", error);
        if (error.response) {
          toast.error(error.response.data);
        } else {
          toast.error(error.message || "Failed to fetch fee record");
        }
      } finally {
        setLoading(false);
      }
    };

    if (location.state && location.state.id) {
      fetchRecord();
    } else {
      toast.error("Missing required student information");
      navigate(-1);
    }
  }, [location.state, setValue, navigate]);

  const updateRecord = async (data) => {
    try {
      if (showConfirm) {
        confirmAction();
      } else {
        setShowConfirm(true);
        setConfirmAction(() => async () => {
          setUpdating(true); // Indicate loading state for submission
          try {
            const updatedMonthData = {
              month_fee: parseFloat(data.month_fee) || 0,
              transportation_fee: parseFloat(data.transportation_fee) || 0,
              exam_fee: parseFloat(data.exam_fee) || 0,
              // Assuming 'paid_status' and 'paid_date' are handled by backend or not needed here for receipt
            };

            const payloadForBackend = {
              ...record[0], // existing student fee record structure
              records: {
                ...record[0]?.records,
                [location.state.month]: updatedMonthData,
              },
            };

            const response = await axios.patch(
              getApiUrl(`/editFee/${location.state.id}`), // student.id is in location.state.id
              payloadForBackend,
              { withCredentials: true }
            );

            toast.success(response.data.message || "Fee record updated successfully!");
            
            // Prepare data for receipt page
            const receiptPdfData = {
              month: location.state.month,
              month_fee: updatedMonthData.month_fee,
              transportation_fee: updatedMonthData.transportation_fee,
              exam_fee: updatedMonthData.exam_fee,
              total: updatedMonthData.month_fee + updatedMonthData.transportation_fee + updatedMonthData.exam_fee,
            };

            // Navigate back to ViewFee with student object and receipt data
            if (location.state.student) { // Ensure student object is available
              navigate("/view-fee", { 
                state: { 
                  student: location.state.student, // Pass the full student object back
                  showReceiptForMonth: true,
                  receiptData: receiptPdfData 
                } 
              });
            } else {
              // Fallback or error if student object is missing (should not happen with the new ViewFee logic)
              toast.error("Student details missing, cannot show receipt. Redirecting to student list.");
              navigate("/fetch-students"); 
            }

          } catch (patchError) {
            if (patchError.response) {
              toast.error(patchError.response.data.message || patchError.response.data || "Failed to update fee record.");
            } else {
              toast.error(patchError.message || "An error occurred while updating the fee record.");
            }
          } finally {
            setUpdating(false);
            setShowConfirm(false); // Reset confirmation modal
          }
        });
      }
    } catch (error) { // This catch is for the outer try-catch, unlikely to be hit if logic is inside setConfirmAction
      if (error.response) {
        toast.error(error.response.data);
      } else {
        toast.error(error.message);
      }
    }
  };

  // Calculate form totals
  const monthFee = parseFloat(watch("month_fee") || 0);
  const transportationFee = parseFloat(watch("transportation_fee") || 0);
  const examFee = parseFloat(watch("exam_fee") || 0);
  const totalFee = monthFee + transportationFee + examFee;

  // Add button to apply class fee structure
  const applyClassFeeStructure = () => {
    if (!feeStructure) {
      toast.error("Fee structure not available for this class");
      return;
    }
    
    setValue("month_fee", feeStructure.monthlyFee);
    setValue("transportation_fee", feeStructure.transportationFee);
    setValue("exam_fee", feeStructure.examFee);
    toast.success("Applied class fee structure");
  };

  return location.state ? (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-gray-200 mb-4">
            <svg className="w-6 h-6 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Fee Record</h2>
          <p className="text-gray-600 text-sm mt-1">
            Month: <span className="font-medium">{location.state?.month}</span>
          </p>
        </div>
        
        {/* Class Fee Structure Card (New) */}
        {feeStructure && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#0a66c2] to-[#0073b1] px-6 py-3">
              <h2 className="text-white text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Class Fee Structure
              </h2>
            </div>
            <div className="p-4 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-gray-500">Monthly Fee</p>
                  <p className="font-medium">Rs. {feeStructure.monthlyFee}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transportation Fee</p>
                  <p className="font-medium">Rs. {feeStructure.transportationFee}</p>
                </div>
                <div>
                  <p className="text-gray-500">Exam Fee</p>
                  <p className="font-medium">Rs. {feeStructure.examFee}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={applyClassFeeStructure}
                className="w-full mt-3 text-white bg-[#0a66c2] hover:bg-[#004182] focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-xs px-4 py-1.5 text-center inline-flex items-center justify-center shadow-sm transition-colors duration-200"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply Class Fee Structure
              </button>
            </div>
          </div>
        )}
        
        {/* Fee Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0a66c2] to-[#0073b1] px-6 py-4">
            <h2 className="text-white text-lg font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Fee Details
            </h2>
            <p className="text-blue-100 text-sm">
              Update payment information for this month
            </p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="py-8 flex justify-center items-center">
                <svg className="animate-spin h-8 w-8 text-[#0a66c2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-gray-600">Loading fee data...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit(updateRecord)} className="space-y-5">

                <div>
                  <label
                    htmlFor="month_fee"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Monthly Fee
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs.</span>
                    </div>
                    <input
                      type="number"
                      id="month_fee"
                      name="month_fee"
                      className="pl-12 block w-full shadow-sm border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] py-2.5 transition-colors text-sm"
                      placeholder="0.00"
                      {...register("month_fee")}
                    />
                  </div>
                  {errors.month_fee && (
                    <p className="mt-1 text-sm text-red-600">{errors.month_fee.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="transportation_fee"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Transportation Fee
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs.</span>
                    </div>
                    <input
                      type="number"
                      id="transportation_fee"
                      name="transportation_fee"
                      className="pl-12 block w-full shadow-sm border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] py-2.5 transition-colors text-sm"
                      placeholder="0.00"
                      {...register("transportation_fee")}
                    />
                  </div>
                  {errors.transportation_fee && (
                    <p className="mt-1 text-sm text-red-600">{errors.transportation_fee.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="exam_fee"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Exam Fee
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs.</span>
                    </div>
                    <input
                      type="number"
                      id="exam_fee"
                      name="exam_fee"
                      className="pl-12 block w-full shadow-sm border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] py-2.5 transition-colors text-sm"
                      placeholder="0.00"
                      {...register("exam_fee")}
                    />
                  </div>
                  {errors.exam_fee && (
                    <p className="mt-1 text-sm text-red-600">{errors.exam_fee.message}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-lg font-semibold text-[#0a66c2]">Rs. {totalFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex justify-center items-center px-4 py-2.5 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0a66c2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Update Record
                      </>
                    )}
                  </button>
                  
                  <Link to="/fetch-students" className="flex-1">
                    <button
                      type="button"
                      className="w-full flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Cancel
                    </button>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Fee Summary Card */}
        {record.length > 0 && !loading && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Current Payment</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Admission Fee:</span>
                <span className="font-medium">Rs. {record[0]?.records[location.state.month]?.adm_fee || 0}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Current Monthly Fee:</span>
                <span className="font-medium">Rs. {record[0]?.records[location.state.month]?.month_fee || 0}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Current Computer Fee:</span>
                <span className="font-medium">Rs. {record[0]?.records[location.state.month]?.comp_fee || 0}</span>
              </div>
              <div className="flex justify-between text-sm font-medium mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-700">Total:</span>
                <span className="text-[#0a66c2]">Rs. {(record[0]?.records[location.state.month]?.adm_fee || 0) + 
                  (record[0]?.records[location.state.month]?.month_fee || 0) + 
                  (record[0]?.records[location.state.month]?.comp_fee || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <NoAccess />
  );
};

export default EditFeeRecord;