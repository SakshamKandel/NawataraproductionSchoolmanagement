import React, { useState, useEffect } from "react";
import NoAccess from "../../NoAccess";
import { useForm } from "react-hook-form";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import StepperInNoticeForm from "./StepperInNoticeForm";
import { toast } from 'react-toastify';
import { getApiUrl } from '../../../config/api.js';


const CreateNotice = () => {
  const adminLoggedIn = document.cookie.includes("adminToken");
  const [step, setStep] = useState(1);
  const [forTeachers, setForTeachers] = useState(false);
  const [forStudents, setForStudents] = useState(false);
  
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  
  // Watch the targetaudience field to update checkboxes
  const targetAudience = watch("targetaudience");
  
  // Update checkboxes when target audience changes
  useEffect(() => {
    if (targetAudience === "All") {
      // For "All", both flags should be false to indicate public access
      setForTeachers(false);
      setForStudents(false);
    } else if (targetAudience === "Teachers & Staffs") {
      setForTeachers(true);
      setForStudents(false);
    } else if (targetAudience === "Students") {
      setForTeachers(false);
      setForStudents(true);
    }
  }, [targetAudience]);
  
  const navigate=useNavigate();
  const noticeHandle = async (data) => {
    try {
      const formData = {
        title: data.noticetitle,
        content: data.noticedes,
        forTeachers: forTeachers,  // Send the actual boolean flags
        forStudents: forStudents,  // Send the actual boolean flags
        noticecategory: data.noticecategory
      };
      
      console.log("Submitting notice with data:", formData);
      const response = await axios.post(
        getApiUrl('/api/notices/create'),
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );
      
      console.log("Notice created successfully:", response.data);
      toast.success("Notice created successfully");
      navigate("/notice");
    } catch (error) {
      console.error("Error creating notice:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to create notice");
      } else {
        toast.error(error.message);
      }
    }
  };
  
  const nextFunc = async () => {
    const output = await trigger();
    if (output) {
      setStep(step + 1);
    }
  };
  
  // Changed to 2 steps only - removed attachment step
  const totalSteps = 2;
  
  return adminLoggedIn ? (
    <div className="min-h-screen bg-[#f3f2ef] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
          {/* NAWATARA STYLE header */}
          <div className="flex items-center mb-6 pb-4 border-b border-[#e0e0e0]">
            <div className="p-2 bg-[#e9f0f8] rounded-lg mr-3">
              <svg className="w-6 h-6 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#191919]">
                Create Notice
              </h1>
              <p className="text-sm text-[#666666]">
                Share important information with your audience
              </p>
            </div>
          </div>
          
          <StepperInNoticeForm stepCount={step} totalSteps={totalSteps} />
          
          <form onSubmit={handleSubmit(noticeHandle)} className="mt-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="noticecategory"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Notice Category
                  </label>
                  <select
                    id="noticecategory"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("noticecategory", {
                      required: "You must choose one category!",
                    })}
                  >
                    <option value="">Select a category</option>
                    <option value="General">General</option>
                    <option value="Severe">Severe</option>
                    <option value="Events & Holidays">Events & Holidays</option>
                    <option value="Academic">Academic</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                  {errors.noticecategory && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.noticecategory.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor="targetaudience"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Target Audience
                  </label>
                  <select
                    id="targetaudience"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("targetaudience", {
                      required: "You must choose one audience!",
                    })}
                  >
                    <option value="">Select target audience</option>
                    <option value="All">Public (Visible to Everyone)</option>
                    <option value="Teachers & Staffs">Teachers & Staff Only</option>
                    <option value="Students">Students Only</option>
                  </select>
                  {errors.targetaudience && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.targetaudience.message}
                    </p>
                  )}
                </div>
                
                <div className="p-4 bg-[#f9f9f9] rounded-md border border-[#e0e0e0]">
                  <h3 className="text-sm font-medium text-[#191919] mb-2">Notice Visibility Summary</h3>
                  <p className="text-xs text-[#666666] mb-1">
                    <span className="font-medium">Category:</span> {watch("noticecategory") || "Not selected"}
                  </p>
                  <div className="flex space-x-2">
                    {targetAudience === "All" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        This notice will be visible to public
                      </span>
                    ) : targetAudience === "Teachers & Staffs" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Visible to Teachers & Staff only
                      </span>
                    ) : targetAudience === "Students" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        Visible to Students only
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        Select an audience
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="noticetitle"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Notice Title
                  </label>
                  <input
                    type="text"
                    id="noticetitle"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="Enter a clear, descriptive title"
                    {...register("noticetitle", {
                      required: "Title cannot be empty",
                    })}
                  />
                  {errors.noticetitle && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.noticetitle.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor="noticedes"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Notice Description
                  </label>
                  <textarea
                    id="noticedes"
                    rows="5"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors resize-none"
                    placeholder="Provide detailed information about your notice"
                    {...register("noticedes", {
                      required: "Description cannot be empty",
                    })}
                  ></textarea>
                  {errors.noticedes && 
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.noticedes.message}
                    </p>
                  }
                </div>
                
                <div className="p-4 bg-[#f9f9f9] rounded-md border border-[#e0e0e0]">
                  <h3 className="text-sm font-medium text-[#191919] mb-2">Notice Visibility Summary</h3>
                  <p className="text-xs text-[#666666] mb-1">
                    <span className="font-medium">Category:</span> {watch("noticecategory") || "Not selected"}
                  </p>
                  <div className="flex space-x-2">
                    {targetAudience === "All" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        This notice will be visible to public
                      </span>
                    ) : targetAudience === "Teachers & Staffs" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Visible to Teachers & Staff only
                      </span>
                    ) : targetAudience === "Students" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        Visible to Students only
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        Select an audience
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-[#e0e0e0] flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2 border border-[#0a66c2] rounded-full text-[#0a66c2] font-medium text-sm hover:bg-[#f3f9ff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2"
                >
                  Back
                </button>
              )}
              
              {step < totalSteps && (
                <button
                  type="button"
                  onClick={nextFunc}
                  className="px-5 py-2 bg-[#0a66c2] text-white rounded-full font-medium text-sm hover:bg-[#004182] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 ml-auto"
                >
                  Continue
                </button>
              )}
              
              {step === totalSteps && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0a66c2] text-white rounded-full font-medium text-sm hover:bg-[#004182] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ml-auto flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </>
                  ) : "Post Notice"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <NoAccess></NoAccess>
  );
};

export default CreateNotice;