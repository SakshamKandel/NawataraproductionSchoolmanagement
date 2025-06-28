import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { getApiUrl } from '../../../config/api';

const ClassAssignment = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm();
  
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ];
  
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  
  const selectedTeacher = watch("teacherId");
  const selectedClass = watch("className");
  const selectedSubject = watch("subject");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          getApiUrl('/getTeachers'),
          { withCredentials: true }
        );
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to load teachers. Please try again.");
      }
    };
    
    fetchTeachers();
  }, []);

  const handleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handlePeriodSelection = (period) => {
    if (selectedPeriods.includes(period)) {
      setSelectedPeriods(selectedPeriods.filter(p => p !== period));
    } else {
      setSelectedPeriods([...selectedPeriods, period]);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Validate selections
      if (selectedDays.length === 0 || selectedPeriods.length === 0) {
        toast.error("Please select at least one day and one period");
        setLoading(false);
        return;
      }
      
      // Create the schedule array from selected days and periods
      const schedule = [];
      selectedDays.forEach(day => {
        selectedPeriods.forEach(period => {
          schedule.push({ day, period });
        });
      });
      
      // Prepare data for API
      const payload = {
        teacherId: data.teacherId,
        className: data.className,
        subject: data.subject,
        schedule: schedule
      };
      
      console.log("Sending assignment data:", payload);
      
      // Call API to assign class
      const response = await axios.post(
        getApiUrl('/api/assign-class'),
        payload,
        { withCredentials: true }
      );
      
      console.log("Assignment response:", response.data);
      
      // Handle success
      if (response.status === 201) {
        toast.success(`Successfully assigned ${data.subject} for class ${data.className} to the teacher`);
        // Reset form
        reset();
        setSelectedDays([]);
        setSelectedPeriods([]);
      } else if (response.status === 207) {
        // Some conflicts occurred
        toast.warning("Some time slots could not be assigned due to conflicts. Check details below.");
        console.log("Conflicts:", response.data.conflicts);
      }
    } catch (error) {
      console.error("Error assigning class:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to assign class. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Assign Class to Teacher</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Teacher Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Select Teacher</label>
            <select
              {...register("teacherId", { required: "Please select a teacher" })}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="text-red-500 mt-1">{errors.teacherId.message}</p>
            )}
          </div>

          {/* Class Name */}
          <div>
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

          {/* Subject */}
          <div>
            <label className="block text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              {...register("subject", { required: "Subject is required" })}
              placeholder="e.g., Mathematics"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && (
              <p className="text-red-500 mt-1">{errors.subject.message}</p>
            )}
          </div>
        </div>

        {/* Schedule Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Schedule</h3>
          
          {/* Days Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDaySelection(day)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedDays.includes(day)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Periods Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Select Periods</label>
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handlePeriodSelection(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriods.includes(period)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  Period {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedTeacher && selectedClass && selectedSubject && 
          selectedDays.length > 0 && selectedPeriods.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Assignment Summary</h3>
            <p>
              Assigning <strong>{selectedSubject}</strong> for <strong>{selectedClass}</strong> to{" "}
              <strong>{teachers.find(t => t.id.toString() === selectedTeacher)?.name}</strong>
            </p>
            <p className="mt-2">
              <strong>Schedule:</strong> {selectedDays.length} days × {selectedPeriods.length} periods 
              = {selectedDays.length * selectedPeriods.length} total slots
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              (isSubmitting || loading) ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting || loading ? "Processing..." : "Assign Class"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassAssignment; 