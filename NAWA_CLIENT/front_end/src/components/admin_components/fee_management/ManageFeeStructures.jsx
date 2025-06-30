import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from 'react-toastify';
import NoAccess from "../../NoAccess";
import { getApiUrl } from '../../../config/api';

// Validation schema for fee structure
const schema = yup.object({
  className: yup.string().required("Class name is required"),
  monthlyFee: yup.number().min(0, "Must be a positive number").required("Monthly fee is required"),
  transportationFee: yup.number().min(0, "Must be a positive number").required("Transportation fee is required"),
  examFee: yup.number().min(0, "Must be a positive number").required("Exam fee is required"),
});

const ManageFeeStructures = () => {
  const adminLoggedIn = document.cookie.includes("adminToken");
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStructureId, setSelectedStructureId] = useState(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      className: "",
      monthlyFee: 0,
      transportationFee: 0,
      examFee: 0,
    }
  });

  // Fetch all fee structures on component mount
  useEffect(() => {
    const fetchFeeStructures = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          getApiUrl('/fetch/class/structure/fees'),
          { withCredentials: true }
        );
        
        if (response.data && response.data.data) {
          setFeeStructures(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching fee structures:", error);
        toast.error(error.response?.data || error.message || "Failed to fetch fee structures");
      } finally {
        setLoading(false);
      }
    };

    if (adminLoggedIn) {
      fetchFeeStructures();
    }
  }, [adminLoggedIn]);

  // Handle form submission for creating or updating fee structure
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await axios.post(
        getApiUrl('/fetch/class/structure/fees'),
        data,
        { withCredentials: true }
      );

      toast.success(response.data.message);
      
      // Refresh the list of fee structures
      const updatedList = await axios.get(
        getApiUrl('/fetch/class/structure/fees'),
        { withCredentials: true }
      );
      
      if (updatedList.data && updatedList.data.data) {
        setFeeStructures(updatedList.data.data);
      }
      
      // Reset form and edit mode
      reset();
      setEditMode(false);
      setSelectedStructureId(null);
    } catch (error) {
      console.error("Error saving fee structure:", error);
      toast.error(error.response?.data || error.message || "Failed to save fee structure");
    } finally {
      setSubmitting(false);
    }
  };

  // Set form data when editing an existing fee structure
  const handleEdit = (structure) => {
    setValue("className", structure.className);
    setValue("monthlyFee", structure.monthlyFee);
    setValue("transportationFee", structure.transportationFee);
    setValue("examFee", structure.examFee);
    setSelectedStructureId(structure.id);
    setEditMode(true);
  };

  // Cancel editing
  const handleCancel = () => {
    reset();
    setEditMode(false);
    setSelectedStructureId(null);
  };

  // Calculate total yearly fees for a class
  const calculateYearlyTotal = (structure) => {
    const monthlyFee = parseFloat(structure.monthlyFee) || 0;
    const transportationFee = parseFloat(structure.transportationFee) || 0;
    const examFee = parseFloat(structure.examFee) || 0;
    return (monthlyFee * 12) + (transportationFee * 12) + (examFee * 12);
  };

  return adminLoggedIn ? (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Structure Management</h1>
          <p className="text-gray-600 mt-2">Create and manage class fee structures</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#0a66c2] to-[#0073b1] px-6 py-4">
            <h2 className="text-white text-lg font-medium">
              {editMode ? "Edit Fee Structure" : "Create Fee Structure"}
            </h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>                  <select
                    id="className"
                    className={`block w-full shadow-sm border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] py-2.5 transition-colors text-sm ${
                      errors.className ? "border-red-300" : ""
                    }`}
                    disabled={editMode}
                    {...register("className")}
                  >
                    <option value="">Select a class</option>
                    <option value="Nursery">Nursery</option>
                    <option value="L.K.G.">L.K.G.</option>
                    <option value="U.K.G.">U.K.G.</option>
                    <option value="One">One</option>
                    <option value="Two">Two</option>
                    <option value="Three">Three</option>
                    <option value="Four">Four</option>
                    <option value="Five">Five</option>
                    <option value="Six">Six</option>
                  </select>
                  {errors.className && (
                    <p className="mt-1 text-sm text-red-600">{errors.className.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div>
                  <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Fee
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs.</span>
                    </div>
                    <input
                      type="number"
                      id="monthlyFee"
                      min="0"
                      step="0.01"
                      className={`pl-12 block w-full shadow-sm border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] py-2.5 transition-colors text-sm ${
                        errors.monthlyFee ? "border-red-300" : ""
                      }`}
                      placeholder="0.00"
                      {...register("monthlyFee")}
                    />
                  </div>
                  {errors.monthlyFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.monthlyFee.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="transportationFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Transportation Fee (Monthly)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs.</span>
                    </div>
                    <input
                      type="number"
                      id="transportationFee"
                      min="0"
                      step="0.01"
                      className={`pl-12 block w-full shadow-sm border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] py-2.5 transition-colors text-sm ${
                        errors.transportationFee ? "border-red-300" : ""
                      }`}
                      placeholder="0.00"
                      {...register("transportationFee")}
                    />
                  </div>
                  {errors.transportationFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.transportationFee.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="examFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Fee (Monthly)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs.</span>
                    </div>
                    <input
                      type="number"
                      id="examFee"
                      min="0"
                      step="0.01"
                      className={`pl-12 block w-full shadow-sm border-gray-300 rounded-md focus:ring-[#0a66c2] focus:border-[#0a66c2] py-2.5 transition-colors text-sm ${
                        errors.examFee ? "border-red-300" : ""
                      }`}
                      placeholder="0.00"
                      {...register("examFee")}
                    />
                  </div>
                  {errors.examFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.examFee.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                {editMode && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-[#0a66c2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>{editMode ? "Update" : "Create"} Fee Structure</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Fee Structures List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0a66c2] to-[#0073b1] px-6 py-4">
            <h2 className="text-white text-lg font-medium">Available Fee Structures</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <svg className="animate-spin h-8 w-8 text-[#0a66c2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-gray-600">Loading fee structures...</span>
              </div>
            ) : feeStructures.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No fee structures yet</h3>
                <p className="mt-1 text-sm text-gray-500">Create your first fee structure to get started.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Fee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transportation Fee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Fee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yearly Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeStructures.map((structure) => (
                    <tr key={structure.id} className={selectedStructureId === structure.id ? "bg-blue-50" : "hover:bg-gray-50"}>                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{structure.className}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs. {structure.monthlyFee.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs. {structure.transportationFee.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs. {structure.examFee.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Rs. {calculateYearlyTotal(structure).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">(12 months total)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(structure)}
                          className="text-[#0a66c2] hover:text-[#004182] transition-colors ml-3"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <NoAccess />
  );
};

export default ManageFeeStructures;