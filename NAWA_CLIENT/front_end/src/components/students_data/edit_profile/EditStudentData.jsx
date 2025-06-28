import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NoAccess from "../../NoAccess";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getApiUrl } from '../../../config/api';

// Define animations
const modalAnimations = `
  @keyframes modal-pop {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }
    70% {
      transform: scale(1.02) translateY(0);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes icon-pop {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    70% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes icon-success {
    0% {
      transform: scale(0) rotate(-45deg);
    }
    50% {
      transform: scale(1.2) rotate(15deg);
    }
    100% {
      transform: scale(1) rotate(0);
    }
  }

  @keyframes check {
    0% {
      stroke-dashoffset: 48;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  @keyframes backdrop-fade {
    from {
      opacity: 0;
      backdrop-filter: blur(0);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(4px);
    }
  }

  .animate-modal-pop {
    animation: modal-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-icon-pop {
    animation: icon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-icon-success {
    animation: icon-success 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  }

  .animate-check {
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: check 0.6s cubic-bezier(0.65, 0, 0.35, 1) 0.4s forwards;
  }

  .animate-backdrop {
    animation: backdrop-fade 0.3s ease-out forwards;
  }
`;

const EditStudentData = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial form values
  useEffect(() => {
    if (location.state?.student) {
      const student = location.state.student;
      setValue('name', student.name);
      setValue('grade', student.grade);
      setValue('section', student.section || '');
      setValue('fatherName', student.fatherName);
      setValue('fatherPhone', student.fatherPhone);
      setValue('motherName', student.motherName);
      setValue('motherPhone', student.motherPhone);
      setValue('address', student.address);
      setValue('email', student.email);
    }
  }, [location.state, setValue]);

  const handleFormSubmit = (data) => {
    console.log('Form submitted with data:', JSON.stringify(data, null, 2));
    console.log('Current student:', JSON.stringify(location.state.student, null, 2));
    setFormData(data);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!formData) {
      console.log('No form data available');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Ensure data matches the model fields
      const studentData = {
        name: formData.name,
        grade: formData.grade,
        section: formData.section || null,
        fatherName: formData.fatherName,
        fatherPhone: formData.fatherPhone,
        motherName: formData.motherName,
        motherPhone: formData.motherPhone,
        address: formData.address,
        email: formData.email
      };

      console.log('Submitting student data:', JSON.stringify(studentData, null, 2));
      console.log('Student ID:', location.state.student.id);
      console.log('Request URL:', getApiUrl(`/editStudent/${location.state.student.id}`));
      
          const response = await axios.patch(
        getApiUrl(`/editStudent/${location.state.student.id}`),
        studentData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
          );
      console.log('Update response:', response);
      toast.success(response.data.message || "Student updated successfully");
          navigate("/fetch-students");
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || error.response.data);
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };
  
  const handleCancel = () => {
    setShowConfirm(false);
    setFormData(null);
  };

  if (!location.state?.student) {
    return <NoAccess />;
  }

  return (
    <>
      <style>{modalAnimations}</style>
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
          {/* Form header */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-[#e9f0f8] rounded-lg mr-3 flex-shrink-0">
              <svg className="w-6 h-6 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#191919]">
                Edit Student Profile
              </h1>
              <p className="text-sm text-[#666666]">
                Update student information for {location.state.student.name}
              </p>
            </div>
          </div>
        </div>

          {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            {/* Student Information Section */}
            <div className="mb-6 pb-6 border-b border-[#e0e0e0]">
              <h2 className="text-base font-semibold text-[#191919] mb-4">Student Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Student's Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("name", {
                      required: "Student name is required",
                    })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                    <label htmlFor="grade" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Class
                  </label>                  <select
                      id="grade"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                      {...register("grade", {
                      required: "Class selection is required",
                    })}
                  >
                      <option value="">Select class</option>
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
                    {errors.grade && (
                      <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="section" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Section (Optional)
                  </label>
                  <select
                    id="section"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("section")}
                  >
                    <option value="">No section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Parent Information Section */}
            <div className="mb-6 pb-6 border-b border-[#e0e0e0]">
              <h2 className="text-base font-semibold text-[#191919] mb-4">Parent Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="fatherName" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Father's Name
                  </label>
                  <input
                    type="text"
                      id="fatherName"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("fatherName", {
                      required: "Father's name is required",
                    })}
                  />
                  {errors.fatherName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fatherName.message}</p>
                  )}
                </div>
                
                <div>
                    <label htmlFor="fatherPhone" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Father's Phone
                  </label>
                  <input
                    type="text"
                      id="fatherPhone"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="10-digit phone number"
                    {...register("fatherPhone", {
                      required: "Father's phone is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                  />
                  {errors.fatherPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.fatherPhone.message}</p>
                  )}
                </div>
                
                <div>
                    <label htmlFor="motherName" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                      id="motherName"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("motherName", {
                      required: "Mother's name is required",
                    })}
                  />
                  {errors.motherName && (
                    <p className="mt-1 text-sm text-red-600">{errors.motherName.message}</p>
                  )}
                </div>
                
                <div>
                    <label htmlFor="motherPhone" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Mother's Phone
                  </label>
                  <input
                    type="text"
                      id="motherPhone"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="10-digit phone number"
                    {...register("motherPhone", {
                      required: "Mother's phone is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                  />
                  {errors.motherPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.motherPhone.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-[#191919] mb-4">Contact Information</h2>
              
                <div className="grid grid-cols-1 gap-y-4">
                <div>
                    <label htmlFor="address" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Home Address
                  </label>
                  <textarea
                    id="address"
                    rows="2"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors resize-none"
                    {...register("address", {
                      required: "Address is required",
                    })}
                  ></textarea>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                
                <div>
                    <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-[#191919]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="student@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
            
              {/* Submit Button */}
              <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium text-sm hover:bg-[#0a66c2]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Updating...
                  </>
                ) : (
                    'Update Student'
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
        
        {/* Confirmation Modal */}
        {showConfirm && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-backdrop" />
            
            {/* Modal Content */}
            <div 
              className="relative transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out animate-modal-pop w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="text-center">
                  {/* Success Icon with animation */}
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100/80 animate-icon-pop mb-6">
                    <svg 
                      className="h-8 w-8 text-blue-600 animate-icon-success" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2.5" 
                        d="M5 13l4 4L19 7"
                        className="animate-check"
                      />
              </svg>
            </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Confirm Changes
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Are you sure you want to update this student's information? This action cannot be undone.
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="relative overflow-hidden w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        'Yes, Update Student'
                      )}
                    </span>
                    <div className="absolute inset-0 bg-blue-700 transform origin-left scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EditStudentData;