import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { getApiUrl } from '../../../config/api';

const ViewClassRoutine = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [className, setClassName] = useState("");
  
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ];
  
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  
  const fetchClassRoutine = async (data) => {
    try {
      setLoading(true);
      const response = await axios.get(
        getApiUrl(`/api/class/${data.className}/routine`),
        { withCredentials: true }
      );
      
      setRoutine(response.data.routine);
      setClassName(data.className);
      
      console.log("Class routine:", response.data);
    } catch (error) {
      console.error("Error fetching class routine:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to load class routine");
      }
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">View Class Routine</h2>
      
      <form onSubmit={handleSubmit(fetchClassRoutine)} className="mb-8">
        <div className="flex items-end gap-4">
          <div className="flex-grow">
            <label className="block text-gray-700 mb-2">Class Name</label>
            <input
              type="text"
              {...register("className", { required: "Class name is required" })}
              placeholder="e.g., Class 10"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.className && (
              <p className="text-red-500 mt-1">{errors.className.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Loading..." : "View Routine"}
          </button>
        </div>
      </form>
      
      {routine && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Routine for {className}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Day / Period
                  </th>
                  {periods.map(period => (
                    <th key={period} className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Period {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium text-gray-900">
                      {day}
                    </td>
                    {periods.map(period => {
                      const slot = routine[day]?.[period];
                      return (
                        <td key={period} className="px-4 py-3 border-b text-sm text-center">
                          {slot ? (
                            <div>
                              <div className="font-medium text-gray-900">{slot.subject}</div>
                              <div className="text-gray-500 text-xs">{slot.teacher?.name || "No teacher"}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewClassRoutine; 