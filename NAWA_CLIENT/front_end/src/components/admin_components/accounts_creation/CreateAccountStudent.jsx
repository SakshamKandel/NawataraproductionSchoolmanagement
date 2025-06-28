import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import NoAccess from "../../NoAccess";
import { toast } from 'react-toastify';
import { getApiUrl } from "../../../config/api.js";

const CreateAccountStudent = () => {
  const adminLoggedIn = document.cookie.includes("adminToken");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});  
  const createStudent = async (data) => {
    try {
      const response = await axios.post(
        getApiUrl("/create/student"),
        data,
        { withCredentials: true }
      );
      toast.success(response.data);
      navigate("/");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data);
      } else {
        toast.error(error.message);
      }
    }
  };
  
  return adminLoggedIn ? (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* NAWATARA STYLE header */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-[#e9f0f8] rounded-lg mr-3 flex-shrink-0">
              <FontAwesomeIcon icon={faUserGraduate} className="text-[#0a66c2] text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#191919]">
                Create Student Account
              </h1>
              <p className="text-sm text-[#666666]">
                Add a new student to the Nawa Tara English School system
              </p>
            </div>
          </div>
        </div>

        {/* NAWATARA STYLE form card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
          <form onSubmit={handleSubmit(createStudent)}>
            {/* Student Information Section */}
            <div className="mb-6 pb-6 border-b border-[#e0e0e0]">
              <h2 className="text-base font-semibold text-[#191919] mb-4">Student Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Student's Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="Enter student's full name"
                    {...register("name", {
                      required: "Student name is required",
                    })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor="class_name"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Class
                  </label>                  <select
                    id="class_name"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("class_name", {
                      required: "Class selection is required",
                    })}
                  >
                    <option value="">Select class</option>
                    <option value="Nursery">Nursery</option>
                    <option value="L.K.G.">L.K.G.</option>
                    <option value="U.K.G.">U.K.G.</option>
                    <option value="One">Class 1</option>
                    <option value="Two">Class 2</option>
                    <option value="Three">Class 3</option>
                    <option value="Four">Class 4</option>
                    <option value="Five">Class 5</option>
                    <option value="Six">Class 6</option>
                  </select>
                  {errors.class_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.class_name.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="section"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Section (Optional)
                  </label>
                  <select
                    id="section"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    {...register("section", {
                      // Section is optional now
                    })}
                  >
                    <option value="">No section (default to A)</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                  {errors.section && (
                    <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parent Information Section */}
            <div className="mb-6 pb-6 border-b border-[#e0e0e0]">
              <h2 className="text-base font-semibold text-[#191919] mb-4">Parent Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    htmlFor="father_name"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Father's Name
                  </label>
                  <input
                    type="text"
                    id="father_name"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="Enter father's name"
                    {...register("father_name", {
                      required: "Father's name is required",
                    })}
                  />
                  {errors.father_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.father_name.message}</p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor="father_phone"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Father's Phone
                  </label>
                  <input
                    type="text"
                    id="father_phone"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="10-digit phone number"
                    {...register("father_phone", {
                      required: "Father's phone is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                  />
                  {errors.father_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.father_phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor="mother_name"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    id="mother_name"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="Enter mother's name"
                    {...register("mother_name", {
                      required: "Mother's name is required",
                    })}
                  />
                  {errors.mother_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.mother_name.message}</p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor="mother_phone"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Mother's Phone
                  </label>
                  <input
                    type="text"
                    id="mother_phone"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                    placeholder="10-digit phone number"
                    {...register("mother_phone", {
                      required: "Mother's phone is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                  />
                  {errors.mother_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.mother_phone.message}</p>
                  )}
                </div>
              </div>
            </div>
              {/* Contact Details Section */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-[#191919] mb-4">Contact Details</h2>
              
              <div className="grid grid-cols-1 gap-y-4">
                <div>
                  <label
                    htmlFor="address"
                    className="block mb-1.5 text-sm font-medium text-[#191919]"
                  >
                    Home Address
                  </label>
                  <textarea
                    id="address"
                    rows="2"
                    className="w-full p-2.5 bg-white border border-[#e0e0e0] rounded-md text-[#191919] text-sm focus:ring-[#0a66c2] focus:border-[#0a66c2] hover:border-[#0a66c2] transition-colors resize-none"
                    placeholder="Enter complete home address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                  ></textarea>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                
                <div className="bg-[#f8f9fa] p-4 rounded-md border border-[#e0e0e0]">
                  <p className="text-sm text-[#666666] flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Student login credentials will be generated automatically and can be updated later through the student management section.
                  </p>
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <NoAccess/>
  );
};

export default CreateAccountStudent;