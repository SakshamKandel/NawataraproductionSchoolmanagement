import axios from "axios";
import React, { useEffect, useState } from "react";
import NoAccess from "../../NoAccess";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiSave, FiX, FiInfo } from 'react-icons/fi';
import { getApiUrl } from '../../../config/api';

const RoutineEdit = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm();
  const adminLoggedIn = document.cookie.includes("adminToken");
  const days = [
    { name: "Sunday", color: "border-rose-500", bgColor: "bg-rose-100", iconColor: "text-rose-500" },
    { name: "Monday", color: "border-blue-500", bgColor: "bg-blue-100", iconColor: "text-blue-500" },
    { name: "Tuesday", color: "border-purple-500", bgColor: "bg-purple-100", iconColor: "text-purple-500" },
    { name: "Wednesday", color: "border-amber-500", bgColor: "bg-amber-100", iconColor: "text-amber-500" },
    { name: "Thursday", color: "border-emerald-500", bgColor: "bg-emerald-100", iconColor: "text-emerald-500" },
    { name: "Friday", color: "border-indigo-500", bgColor: "bg-indigo-100", iconColor: "text-indigo-500" },
  ];
  const periods = [
    "period1",
    "period2",
    "period3",
    "period4",
    "period5",
    "period6",
    "period7",
  ];
  
  // React state and hooks remain unchanged
  const [teachers, setTeachers] = useState([]);
  const [routines, setRoutine] = useState([]);
  const [id, setID] = useState();
  const [lastUpdated, setLastUpdated] = useState({}); // Change to object to store per-teacher timestamps
  const [updateStatus, setUpdateStatus] = useState({ success: false, message: "" }); // Track update status
  const selectedTeacher = watch("teachers");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  
  // Modal state for large updates
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [updateConfirmContext, setUpdateConfirmContext] = useState(null); // { flattenedSchedule }
  
  // Helper function to convert period string to integer
  const getPeriodNumber = (periodString) => {
    // Extract the number from strings like "period1", "period2"
    const match = periodString.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };
  
  // Teacher selection will be handled later after fetchRoutine_Teacher is defined
  
  useEffect(() => {
    const fetchTeacherName = async () => {
      try {
        if (adminLoggedIn) {
          const teachersData = await axios.get(
            getApiUrl('/getTeachers'),
            { withCredentials: true }
          );
          
          console.log("Fetched teachers data:", teachersData.data);
          setTeachers(teachersData.data);
          
          // After setting teachers, check if we have a selected teacher
          const currentlySelected = watch("teachers");
          if (currentlySelected) {
            console.log("Currently selected teacher ID:", currentlySelected);
            const matchedTeacher = teachersData.data.find(t => t.id === currentlySelected);
            console.log("Matched teacher:", matchedTeacher);
            
            if (!matchedTeacher) {
              console.warn("Selected teacher ID doesn't match any loaded teachers");
            }
          }
        }
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data);
        } else {
          toast.error(error.message);
        }
      }
    };
    fetchTeacherName();
  }, [watch]);

  const fetchRoutine_Teacher = async (data) => {
    try {
      // Clear previous routine data immediately when switching teachers
      setRoutine([]);
      setUpdateStatus({ success: false, message: "" });
      
      if (routines) {
        setRoutine([]);
      }
      
      console.log("Fetching routine for teacher ID:", data.teachers);
      
      // Verify that the selected teacher exists before proceeding
      const selectedTeacherData = teachers.find(t => String(t.id) === String(data.teachers));
      
      if (!selectedTeacherData) {
        console.error("Selected teacher ID doesn't match any known teacher:", data.teachers);
        toast.error("Could not find the selected teacher. Please try again.");
        return;
      }
      
      console.log("Found matching teacher:", selectedTeacherData.name);
      
      // Store the selected teacher ID in localStorage - normalize it to string
      localStorage.setItem('selectedTeacherId', String(data.teachers));
      
      const result = await axios.get(
        getApiUrl(`/api/teacher/${data.teachers}/routine`),
        { withCredentials: true }
      );
      
      console.log("Routine data received:", result.data);
      
      // Transform the data to the expected format if necessary
      let formattedData = [];
      
      if (Array.isArray(result.data) && result.data.length > 0) {
        // Check if data is already in the expected format with 'schedule' property
        if (result.data[0].schedule) {
          formattedData = result.data;
        } else {
          // Convert from flat structure to nested schedule structure
          const initialSchedule = days.reduce((dayObj, { name }) => {
            dayObj[name] = periods.reduce((periodObj, period) => {
              periodObj[period] = { subject: "", class_ko_name: "" };
              return periodObj;
            }, {});
            return dayObj;
          }, {});
          
          // Fill in the schedule with the received data
          const newSchedule = { ...initialSchedule };
          
          result.data.forEach(item => {
            if (item.day && periods.includes("period" + item.period)) {
              newSchedule[item.day]["period" + item.period] = {
                subject: item.subject || "",
                class_ko_name: item.class || ""
              };
            }
          });
          
          formattedData = [{ schedule: newSchedule }];
        }
      } else if (result.data.length === 0) {
        // Create empty schedule format if no data
        const emptySchedule = days.reduce((dayObj, { name }) => {
          dayObj[name] = periods.reduce((periodObj, period) => {
            periodObj[period] = { subject: "", class_ko_name: "" };
            return periodObj;
          }, {});
          return dayObj;
        }, {});
        
        formattedData = [{ schedule: emptySchedule }];
        toast.info("No routine data found for this teacher. You can create a new schedule.");
      }
      
      console.log("Formatted schedule data:", formattedData);
      setRoutine(formattedData);
      setID(data.teachers);
      
      // Clear update status when loading new teacher
      setUpdateStatus({ success: false, message: "" });
    } catch (error) {
      console.error("Error fetching routine:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        toast.error(error.response.data.message || error.response.data);
      } else {
        toast.error(error.message || "Failed to fetch routine");
      }
      
      // Set empty schedule on error so UI can still be used
      const emptySchedule = days.reduce((dayObj, { name }) => {
        dayObj[name] = periods.reduce((periodObj, period) => {
          periodObj[period] = { subject: "", class_ko_name: "" };
          return periodObj;
        }, {});
        return dayObj;
      }, {});
      
      setRoutine([{ schedule: emptySchedule }]);
      setID(data.teachers);
    }
  };
  
  // Smart teacher selection logic with fallback and validation
  // This is placed after fetchRoutine_Teacher definition to avoid reference issues
  useEffect(() => {
    // Only proceed if we have teachers loaded
    if (teachers.length === 0) return;
    
    // Try multiple sources for teacher selection in priority order
    let teacherId = null;
    let source = null;
    
    // 1. First check sessionStorage for last active teacher (most recent)
    const lastActiveTeacher = sessionStorage.getItem('lastActiveTeacher');
    if (lastActiveTeacher) {
      try {
        const parsed = JSON.parse(lastActiveTeacher);
        // Only use if the selection was made in the last 30 minutes
        if (parsed.id && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          teacherId = parsed.id;
          source = "session";
        }
      } catch (e) {
        console.error("Failed to parse lastActiveTeacher from sessionStorage");
      }
    }
    
    // 2. If no session data, check localStorage (more persistent)
    if (!teacherId) {
      const storedTeacherId = localStorage.getItem('selectedTeacherId');
      if (storedTeacherId) {
        teacherId = storedTeacherId;
        source = "localStorage";
      }
    }
    
    // 3. If still no teacher, see if we can find Saksham in the list
    if (!teacherId) {
      const saksham = teachers.find(t => 
        t.name && t.name.toLowerCase().includes('saksham')
      );
      if (saksham) {
        teacherId = saksham.id;
        source = "default-saksham";
      }
    }
    
    // 4. Last resort: just use the first teacher in the list
    if (!teacherId && teachers.length > 0) {
      teacherId = teachers[0].id;
      source = "first-available";
    }
    
    // Validate that the teacher exists in our data
    if (teacherId) {
      const matchingTeacher = teachers.find(t => String(t.id) === String(teacherId));
      
      if (matchingTeacher) {
        console.log(`Teacher selected from ${source}:`, matchingTeacher.name);
        
        // Set form value
        setValue("teachers", teacherId);
        
        // Load the teacher's routine data if from localStorage 
        // (session-based selections will already have data loaded)
        if (source !== "session") {
          // Use try-catch to avoid any potential errors
          try {
            fetchRoutine_Teacher({ teachers: teacherId });
          } catch (err) {
            console.error("Error loading teacher routine:", err);
            toast.error("Failed to load teacher schedule automatically");
          }
        }
      } else {
        console.warn("Selected teacher ID doesn't match any teacher in the database");
        localStorage.removeItem('selectedTeacherId');
        sessionStorage.removeItem('lastActiveTeacher');
      }
    }
  }, [setValue, teachers]);

  // Clear routine data when teacher selection changes
  useEffect(() => {
    if (selectedTeacher) {
      // Clear previous routine state when teacher changes
      setRoutine([]);
      setUpdateStatus({ success: false, message: "" });
    }
  }, [selectedTeacher]);

  const handleRoutineChange = (name, period, field, value) => {
    console.log(`Updating ${field} for ${name}, period ${period} to: ${value}`);
    setRoutine((prevRoutines) => {
      const updatedRoutines = prevRoutines.map((routine) => {
        // Ensure schedule and the day exist
        if (!routine.schedule) {
          routine.schedule = {};
        }
        
        if (!routine.schedule[name]) {
          routine.schedule[name] = {};
        }
        
        // Ensure the period exists
        if (!routine.schedule[name][period]) {
          routine.schedule[name][period] = { subject: "", class_ko_name: "" };
        }
        
        return {
          ...routine,
          schedule: {
            ...routine.schedule,
            [name]: {
              ...routine.schedule[name],
              [period]: {
                ...routine.schedule[name][period],
                [field]: value,
              },
            },
          },
        };
      });
      
      console.log("Updated routines:", updatedRoutines);
      
      // Clear previous update status when making changes
      setUpdateStatus({ success: false, message: "" });
      
      return updatedRoutines;
    });
  };

  const handleUpdateChange = async () => {
    try {
      // Extract schedule data from routines state
      if (!routines || routines.length === 0) {
        toast.error("No routine data to update");
        return;
      }

      // Convert the nested schedule object to an array format that backend expects
      const flattenedSchedule = [];
      
      routines.forEach(routine => {
        if (!routine.schedule) return;
        
        // Iterate through each day and period
        Object.entries(routine.schedule).forEach(([day, periods]) => {
          Object.entries(periods).forEach(([periodString, data]) => {
            // Only include entries that have subject or class data
            if (data.subject || data.class_ko_name) {
              // Convert period string (e.g., "period1") to integer (e.g., 1)
              const periodNumber = getPeriodNumber(periodString);
              
              if (periodNumber === null) {
                console.error(`Invalid period format: ${periodString}`);
                return; // Skip this entry
              }
              
              flattenedSchedule.push({
                day: day,
                period: periodNumber, // Send integer value instead of string
                subject: data.subject || '',
                class: data.class_ko_name || ''
              });
            }
          });
        });
      });
      
      console.log("Sending routine data to server:", flattenedSchedule);
      
      if (flattenedSchedule.length === 0) {
        toast.warn("No routine data to send - add at least one class first");
        return;
      }
      
      // Show confirm dialog for large changes
      if (flattenedSchedule.length > 10) {
        setUpdateConfirmContext({ flattenedSchedule });
        setShowUpdateConfirmModal(true);
        return; // Stop here, let modal confirmation trigger the actual update
      }

      // If not a large change, proceed directly
      await performUpdateRoutine(flattenedSchedule);

    } catch (error) {
      console.error('Error preparing update for routine:', error);
      toast.error("An unexpected error occurred while preparing the update.");
    }
  };

  const performUpdateRoutine = async (scheduleToUpdate) => {
    const toastId = toast.loading("Updating routine...", { autoClose: false });
    try {
      const updateTime = new Date();
      
      const response = await axios.patch(
        getApiUrl(`/api/teacher/${id}/routine`),
        { data: scheduleToUpdate },
        { withCredentials: true }
      );
      
      toast.update(toastId, { 
        render: response.data.message || "Routine updated successfully", 
        type: 'success',
        autoClose: 3000,
        isLoading: false
      });
      
      console.log("Update response:", response.data);
      
      setLastUpdated(prev => ({
        ...prev,
        [id]: updateTime
      }));
      
      setUpdateStatus({
        success: true,
        message: `Routine for ${getSelectedTeacherName()} was updated successfully`
      });
      
      setTimeout(() => {
        fetchRoutine_Teacher({ teachers: id });
      }, 500);
    } catch (error) {
      console.error('Error updating routine:', error);
      let errorMessage = "Failed to update routine";
      if (error.response) {
        errorMessage = error.response.data.message || error.response.data || errorMessage;
        if (error.response.data.error) {
          errorMessage += `: ${error.response.data.error}`;
        }
      } else if (error.request) {
        errorMessage = "Server did not respond. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      toast.update(toastId, { render: errorMessage, type: 'error', autoClose: 5000, isLoading: false });
      setUpdateStatus({
        success: false,
        message: errorMessage
      });
    }
  };

  const confirmUpdateAction = () => {
    if (updateConfirmContext && updateConfirmContext.flattenedSchedule) {
      performUpdateRoutine(updateConfirmContext.flattenedSchedule);
    }
    setShowUpdateConfirmModal(false);
    setUpdateConfirmContext(null);
  };

  // Function to get selected teacher name
  const getSelectedTeacherName = () => {
    if (!selectedTeacher) {
      console.log("No teacher selected");
      return "No Teacher Selected";
    }
    
    console.log("Getting name for teacher ID:", selectedTeacher);
    console.log("Available teachers:", teachers);
    
    // Try to find by strict equality first
    let teacher = teachers.find(t => t.id === selectedTeacher);
    
    // If not found, try string comparison (IDs might be coming as strings)
    if (!teacher && selectedTeacher) {
      console.log("Trying string comparison for ID");
      teacher = teachers.find(t => String(t.id) === String(selectedTeacher));
    }
    
    // Special handling for Saksham - to make sure we identify him correctly
    if (teacher && teacher.name && teacher.name.toLowerCase().includes('saksham')) {
      console.log("FOUND SAKSHAM KANDEL - Ensuring correct display");
      // If for any reason we get a partial match, complete the full name
      if (teacher.name !== "Saksham Kandel") {
        teacher.name = "Saksham Kandel";
      }
    }
    
    // Log the result for debugging
    if (teacher) {
      console.log("Found teacher:", teacher.name);
    } else {
      console.warn(`Teacher with ID ${selectedTeacher} not found in teachers list`);
    }
    
    return teacher ? teacher.name : "Unknown Teacher";
  };

  // Add a TeacherInfo component to display when clicking on a teacher
  const TeacherInfo = ({ teacher }) => {
    if (!teacher) return null;
    
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 border border-[#e0e9ec] animate-slideInUp">
        <div className="bg-white p-6 border-b border-[#e6e9ec]">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 bg-blue-500">
              {teacher.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{teacher.name}</h3>
              <div className="flex items-center text-blue-600 mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
                <p className="text-sm">Teacher ID: <span className="font-mono bg-blue-50 px-2 py-0.5 rounded text-blue-700">{teacher.id}</span></p>
              </div>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1 animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="animate-slideInRight" style={{animationDelay: '0.1s'}}>
              <h4 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                Contact Information
              </h4>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-700">{teacher.email}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-700">{teacher.contact || 'No contact information'}</span>
                </div>
              </div>
            </div>
            
            <div className="animate-slideInRight" style={{animationDelay: '0.2s'}}>
              <h4 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                Schedule Summary
              </h4>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Classes:</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">35 / week</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Schedule Status:</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return teachers && adminLoggedIn ? (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4 sm:px-6 lg:px-8">
      {/* NAWATARA STYLE page header with card */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-[#e0e0e0] mb-5 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#e9f0f8] rounded-lg">
                  <svg className="w-7 h-7 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#191919]">
                    Teacher Routine Management
                  </h1>
                  <p className="mt-1 text-sm text-[#666666]">
                    View and edit teaching schedules for your faculty members
                  </p>
                </div>
              </div>
              
              {selectedTeacher && (
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0077B5] to-[#0a66c2] flex items-center justify-center text-white font-semibold text-lg mr-3">
                    {getSelectedTeacherName().charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-blue-500">Selected Teacher</p>
                    <p className="text-sm font-semibold text-blue-800">{getSelectedTeacherName()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-[#e0e0e0] px-6 py-5 bg-[#fafafa]">
            <form onSubmit={handleSubmit(fetchRoutine_Teacher)}>
              <div className="mb-4">
                <label 
                  htmlFor="teachers" 
                  className="block text-sm font-medium text-[#191919] mb-2 flex items-center"
                >
                  <svg className="w-4 h-4 text-[#0a66c2] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Select Teacher
                </label>
                <div className="relative">
                  {/* Animated teacher selection */}
                  <div className="relative">
                    <select
                      name="teachers"
                      id="teachers"
                      className={`w-full pl-3 pr-10 py-3 text-base border border-[#d0d5dd] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] transition duration-200 appearance-none bg-white ${selectedTeacher ? "text-[#191919]" : "text-[#6e6e6e]"}`}
                      {...register("teachers", {
                        required: "Please select a teacher to view their schedule",
                        onChange: (e) => {
                          const selectedId = e.target.value;
                          if (!selectedId) return;
                          
                          // Find the teacher in our data
                          const selectedTeacher = teachers.find(t => String(t.id) === String(selectedId));
                          
                          if (selectedTeacher) {
                            // Store selection in session storage for persistence
                            sessionStorage.setItem('lastActiveTeacher', JSON.stringify({
                              id: selectedId,
                              name: selectedTeacher.name,
                              timestamp: Date.now()
                            }));
                            
                            // Load the teacher's routines immediately
                            fetchRoutine_Teacher({ teachers: selectedId });
                            
                            // Clear any previous error states
                            setUpdateStatus({ success: true, message: `Loaded ${selectedTeacher.name}'s schedule` });
                          } else {
                            console.error("Invalid teacher selection - ID not found in teachers list");
                            toast.error("Selected teacher not found in database");
                          }
                        }
                      })}
                    >
                      <option value="">Select a faculty member</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6e6e6e]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Sliding animation for selected teacher */}
                  {selectedTeacher && (
                    <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-[#0a66c2] transform transition-transform duration-200 animate-fadeIn">
                      Selected Teacher
                    </div>
                  )}
                </div>

                {errors.teachers && (
                  <p className="mt-2 text-sm text-[#d93025] flex items-center">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    {errors.teachers.message}
                  </p>
                )}

                {/* Display selected teacher with LinkedIn-like styling */}
                {selectedTeacher && (
                  <div className="mt-3 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0077B5] to-[#0a66c2] flex items-center justify-center text-white font-semibold text-sm">
                      {getSelectedTeacherName().charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-2 text-sm font-medium text-[#191919] animate-slideInRight">
                      {getSelectedTeacherName()}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Teacher Data Status */}
              <div className="mt-4 relative overflow-hidden rounded-lg border">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
                <div className="relative p-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Selected Teacher</h3>
                      <p className="text-sm text-gray-500">{selectedTeacher ? 'Currently Selected' : 'None'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Data Status</h3>
                      <p className="text-sm text-gray-500">
                        {routines && routines.length > 0 ? 'Loaded' : 'Not loaded'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center w-full px-4 py-3 mt-4 text-base font-medium text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2]"
                  onClick={(e) => {
                    e.preventDefault();
                    
                    const teacherId = watch("teachers");
                    if (!teacherId) {
                      toast.info("Please select a teacher first");
                      return;
                    }
                    
                    // Find teacher in the list
                    const selectedTeacher = teachers.find(t => String(t.id) === String(teacherId));
                    if (!selectedTeacher) {
                      toast.error("Selected teacher not found in database");
                      return;
                    }
                    
                    // Focus on specific teachers
                    let toastMessage = `Loading ${selectedTeacher.name}'s schedule`;
                    let priority = false;
                    
                    if (selectedTeacher.name.toLowerCase().includes('saksham')) {
                      toastMessage = "Loading Saksham Kandel's schedule";
                      priority = true;
                    }
                    
                    // Show toast with appropriate priority
                    if (priority) {
                      toast.success(toastMessage);
                    } else {
                      toast.info(toastMessage);
                    }
                    
                    // Fetch the routine data
                    fetchRoutine_Teacher({ teachers: teacherId });
                    
                    // Update app state
                    setUpdateStatus({
                      success: true,
                      message: `${selectedTeacher.name}'s schedule loaded successfully`
                    });
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {/* Display selection state - either prompt or teacher info */}
            {!selectedTeacher ? (
              <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
                <svg className="w-12 h-12 mx-auto text-blue-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <h3 className="text-lg font-medium text-blue-800 mb-1">Select a Teacher</h3>
                <p className="text-blue-600">Please choose a teacher from the dropdown menu and click "View Schedule" to manage their routine.</p>
              </div>
            ) : routines && routines.length > 0 ? (
              <div className="mt-6">
                <TeacherInfo teacher={teachers.find(t => t.id === selectedTeacher)} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Update Confirmation Modal */}
      {showUpdateConfirmModal && updateConfirmContext && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 transform transition-all duration-300 ease-out scale-95 group-hover:scale-100">
            <div className="flex items-start">
              <div className="p-2 bg-orange-100 rounded-full mr-4">
                <FiInfo className="text-3xl text-orange-500" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Confirm Large Update</h3>
                <p className="text-sm text-gray-600">
                  You are about to update <strong className="font-medium text-orange-600">{updateConfirmContext.flattenedSchedule.length}</strong> schedule entries.
                  Are you sure you want to continue?
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowUpdateConfirmModal(false);
                  setUpdateConfirmContext(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 -mt-2 -mr-2">
                <FiX size={24} />
              </button>
            </div>
            <div className="mt-6 sm:mt-8 flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={() => {
                  setShowUpdateConfirmModal(false);
                  setUpdateConfirmContext(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-150 ease-in-out shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateAction}
                className="px-4 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg flex items-center"
              >
                <FiSave className="mr-2 h-4 w-4" />
                Yes, Update All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAWATARA STYLE schedule table - only displayed when teacher is selected and routines are loaded */}
      {selectedTeacher && routines.length > 0 && (
        <div className="max-w-7xl mx-auto mt-5 space-y-5">
          {/* LinkedIn Activity card-like header */}
          <div className="flex justify-between items-center bg-white rounded-t-xl shadow-sm border border-[#e0e0e0] p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0a66c2] flex items-center justify-center text-[#0a66c2]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-medium text-[#191919]">Teaching Schedule</h2>
                <p className="text-sm text-[#666666]">
                  <span className="font-semibold text-[#0a66c2]">{getSelectedTeacherName()}</span>'s weekly class routines
                </p>
                
                {/* Show last updated time if available */}
                {lastUpdated[id] && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                    </svg>
                    Last updated: {lastUpdated[id].toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleUpdateChange}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full shadow-md text-white bg-[#0a66c2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-all duration-300 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-[#004182] group-hover:skew-x-12 group-hover:translate-x-full"></span>
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform skew-x-12 bg-[#0a66c2] group-hover:-skew-x-12 group-hover:translate-x-full"></span>
              <span className="relative flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                Save {getSelectedTeacherName()}'s Schedule
              </span>
            </button>
          </div>

          {/* Update status notification banner */}
          {updateStatus.success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    {updateStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NAWATARA STYLE table card */}
          <div className="bg-white rounded-b-xl shadow-sm border border-[#e0e0e0] border-t-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e0e0e0]">
                <thead>
                  <tr className="bg-[#f3f6fa]">
                    <th scope="col" className="pl-6 pr-3 py-3 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider sticky left-0 bg-[#f3f6fa] shadow-sm z-10 w-36 border-r border-[#e0e0e0]">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Day</span>
                      </div>
                    </th>
                    {periods.map((period, index) => (
                      <th 
                        key={period} 
                        scope="col" 
                        className="px-4 py-3 text-center text-xs font-semibold text-[#666666] uppercase tracking-wider"
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-[#e9f0f8] text-[#0a66c2] mr-2 text-xs font-medium animate-zoomIn" style={{animationDelay: `${0.2 + index * 0.05}s`}}>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                            </svg>
                            Period {period.slice(6)}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-[#e0e0e0]">
                  {days.map(({ name, color, bgColor, iconColor }) => (
                    <tr key={name} className="hover:bg-[#f9fafb] transition-colors duration-200 animate-slideInUp">
                      <td className={`py-4 px-4 whitespace-nowrap border-l-4 ${color} day-cell-highlight`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center ${iconColor}`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-[#191919]">{name}</div>
                          </div>
                        </div>
                      </td>
                      {periods.map((period) => {
                        // Ensure routines[0] and routines[0].schedule exist
                        const schedule = routines[0]?.schedule || {};
                        // Ensure day and period exist in schedule
                        const daySchedule = schedule[name] || {};
                        const periodData = daySchedule[period] || { subject: "", class_ko_name: "" };
                        
                        return (
                          <td key={period} className="py-3 px-3">
                            <div className="border border-gray-200 rounded-lg p-2 hover-lift transition-all duration-300 hover:shadow-md">
                              <input
                                type="text"
                                placeholder="Subject"
                                className="w-full mb-2 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] transition-all duration-200"
                                value={periodData.subject || ""}
                                onChange={(e) =>
                                  handleRoutineChange(name, period, "subject", e.target.value)
                                }
                              />
                              <input
                                type="text"
                                placeholder="Class"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] transition-all duration-200"
                                value={periodData.class_ko_name || ""}
                                onChange={(e) =>
                                  handleRoutineChange(name, period, "class_ko_name", e.target.value)
                                }
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* NAWATARA STYLE connection recommendation card for tips */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e0e0e0] overflow-hidden">
            <div className="p-4 border-l-4 border-[#0a66c2] flex">
              <div className="flex-shrink-0 p-1 bg-[#e9f0f8] rounded-md">
                <svg className="h-5 w-5 text-[#0a66c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-[#191919]">Quick Tips</h3>
                <div className="mt-2 text-xs text-[#666666] grid grid-cols-1 md:grid-cols-3 gap-3 staggered-appear">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300">
                    <p className="flex items-center font-medium text-gray-700 mb-1">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                      </svg>
                      Editing
                    </p>
                    <p className="text-gray-600 pl-6">Click directly within any cell to edit subject and class information</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-300">
                    <p className="flex items-center font-medium text-gray-700 mb-1">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Saving
                    </p>
                    <p className="text-gray-600 pl-6">Remember to save changes when finished to update the database</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all duration-300">
                    <p className="flex items-center font-medium text-gray-700 mb-1">
                      <svg className="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                      </svg>
                      Clearing Assignments
                    </p>
                    <p className="text-gray-600 pl-6">Clear both fields to remove class assignments completely</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <NoAccess />
  );
};

// Add CSS animations for the component
const fadeInAnimation = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse-subtle {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-slideInUp {
  animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-slideInRight {
  animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-zoomIn {
  animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-pop {
  animation: pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.staggered-appear > * {
  opacity: 0;
  animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.staggered-appear > *:nth-child(1) { animation-delay: 0.1s; }
.staggered-appear > *:nth-child(2) { animation-delay: 0.15s; }
.staggered-appear > *:nth-child(3) { animation-delay: 0.2s; }
.staggered-appear > *:nth-child(4) { animation-delay: 0.25s; }
.staggered-appear > *:nth-child(5) { animation-delay: 0.3s; }
.staggered-appear > *:nth-child(6) { animation-delay: 0.35s; }
.staggered-appear > *:nth-child(7) { animation-delay: 0.4s; }

.shimmer-bg {
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

.card-3d-effect {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-3d-effect:hover {
  transform: translateY(-5px) scale(1.01);
}

.hover-lift {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.day-cell-highlight {
  position: relative;
  overflow: hidden;
}

.day-cell-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  opacity: 0.7;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.day-cell-highlight:hover::before {
  opacity: 1;
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes orbit {
  0% { 
    transform: rotate(0deg) translateX(10px) rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg) translateX(10px) rotate(-360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-orbit {
  animation: orbit 8s linear infinite;
}
`;

// Inject the styles into the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = fadeInAnimation;
  document.head.appendChild(styleElement);
}

export default RoutineEdit;