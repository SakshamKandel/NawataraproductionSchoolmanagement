import React, { useEffect, useState } from "react";
import NoAccess from "../../NoAccess";
import axios from "axios";
import { toast } from 'react-toastify';
import { getApiUrl } from '../../../config/api.js';

const RoutineSee = () => {
  const teacherLoggedIn = document.cookie.includes("teacherToken");
  const days = [
    { name: "Sunday", color: "border-blue-500" },
    { name: "Monday", color: "border-indigo-500" },
    { name: "Tuesday", color: "border-amber-500" },
    { name: "Wednesday", color: "border-green-500" },
    { name: "Thursday", color: "border-gray-500" },
    { name: "Friday", color: "border-red-500" },
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
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        if (teacherLoggedIn) {
          setLoading(true);
          
          // Try the new API endpoint first
          try {
            const response = await axios.get(
              getApiUrl('/teacher/routine'),
              { withCredentials: true }
            );
            
            console.log("Routine data received:", response.data);
            
            // Transform flat data into nested format
            if (Array.isArray(response.data)) {
              const initialSchedule = days.reduce((dayObj, { name }) => {
                dayObj[name] = periods.reduce((periodObj, period) => {
                  periodObj[period] = { subject: "", class_ko_name: "" };
                  return periodObj;
                }, {});
                return dayObj;
              }, {});
              
              // Fill in the schedule with the received data
              const newSchedule = { ...initialSchedule };
              
              response.data.forEach(item => {
                if (item.day && item.period) {
                  const periodKey = `period${item.period}`;
                  if (newSchedule[item.day] && periods.includes(periodKey)) {
                    newSchedule[item.day][periodKey] = {
                      subject: item.subject || "",
                      class_ko_name: item.class || ""
                    };
                  }
                }
              });
              
              // Set the formatted data
              setRoutines([{ schedule: newSchedule }]);
              
              // Set last updated time if any routine exists
              if (response.data.length > 0) {
                const latestUpdate = response.data.reduce((latest, current) => {
                  const currentDate = new Date(current.updatedAt);
                  return latest < currentDate ? currentDate : latest;
                }, new Date(0));
                setLastUpdated(latestUpdate);
              }
            }
            
            setLoading(false);
          } catch (error) {
            console.warn("Failed to fetch from new API, trying legacy endpoint", error);
            
            // Fallback to old endpoint if new one fails
            const response = await axios.get(
              getApiUrl('/fetch/routines'),
              { withCredentials: true }
            );
            
            // Legacy format handling
            if (Array.isArray(response.data)) {
              // Same transformation as above
              const initialSchedule = days.reduce((dayObj, { name }) => {
                dayObj[name] = periods.reduce((periodObj, period) => {
                  periodObj[period] = { subject: "", class_ko_name: "" };
                  return periodObj;
                }, {});
                return dayObj;
              }, {});
              
              const newSchedule = { ...initialSchedule };
              
              response.data.forEach(item => {
                if (item.day && item.period) {
                  const periodKey = `period${item.period}`;
                  if (newSchedule[item.day] && periods.includes(periodKey)) {
                    newSchedule[item.day][periodKey] = {
                      subject: item.subject || "",
                      class_ko_name: item.class || ""
                    };
                  }
                }
              });
              
              setRoutines([{ schedule: newSchedule }]);
              
              // Set last updated time if any routine exists
              if (response.data.length > 0) {
                const latestUpdate = response.data.reduce((latest, current) => {
                  const currentDate = new Date(current.updatedAt);
                  return latest < currentDate ? currentDate : latest;
                }, new Date(0));
                setLastUpdated(latestUpdate);
              }
            }
            
            setLoading(false);
          }
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching routine:", error);
        if (error.response) {
          toast.error(error.response.data.message || error.response.data);
        } else {
          toast.error(error.message || "Failed to fetch your routine");
        }
      }
    };

    fetchRoutines();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchRoutines, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return teacherLoggedIn ? (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center items-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin"></div>
              <p className="text-sm font-medium text-gray-500">Loading your teaching schedule...</p>
            </div>
          </div>
        ) : routines.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50">
              <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Schedule Available</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Your teaching schedule has not been assigned yet. Please check back later or contact the administration.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header - Save Changes Button Removed */}
            <div className="p-4 flex items-center border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Teaching Schedule</h2>
                  <p className="text-sm text-gray-500">Your weekly class routines</p>
                  
                  {/* Display last update time if available */}
                  {lastUpdated && (
                    <p className="text-xs text-blue-500 mt-1">
                      Last updated: {lastUpdated.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Refresh button */}
              <button 
                onClick={() => window.location.reload()}
                className="ml-auto inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="w-20 py-3 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    {periods.map((period, index) => (
                      <th 
                        key={period}
                        className="py-3 px-3 text-center text-xs font-medium text-blue-600 uppercase"
                      >
                        Period {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(({ name, color }) => (
                    <tr key={name} className="border-b border-gray-100">
                      <td className={`py-3 px-3 border-l-4 ${color}`}>
                        <span className="font-medium text-gray-800">{name}</span>
                      </td>
                      {periods.map((period) => {
                        // Safely access schedule data
                        const schedule = routines[0]?.schedule || {};
                        const daySchedule = schedule[name] || {};
                        const classInfo = daySchedule[period] || { subject: "", class_ko_name: "" };
                        const hasClass = classInfo.subject;
                        
                        return (
                          <td key={period} className="py-2 px-2">
                            <div className="border border-gray-200 rounded p-2 h-full min-h-[70px] text-sm">
                              {hasClass ? (
                                <>
                                  <div className="font-medium text-gray-800">{classInfo.subject}</div>
                                  <div className="text-xs text-gray-500 mt-1">Class {classInfo.class_ko_name}</div>
                                </>
                              ) : (
                                <div className="text-gray-300 font-light h-full flex items-center justify-center">
                                  -
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Updated Info Section (replacing Quick Tips) */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="font-medium text-gray-700">Schedule Information</h3>
              </div>
              <ul className="ml-7 space-y-1">
                <li className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  </svg>
                  This is your official teaching schedule for the current term
                </li>
                <li className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Schedule is maintained by the administration team
                </li>
                <li className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Contact the office for any schedule adjustments or conflicts
                </li>
                <li className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Click the Refresh button to load the latest updates
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <NoAccess />
  );
};

export default RoutineSee;