import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NoticeMap from './notices/NoticeMap';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaSpinner, 
  FaRegSadCry, 
  FaClock,
  FaRegCalendarAlt, 
  FaRegBell,
  FaSearch,
  FaInfoCircle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBook,
  FaUserFriends,
  FaCog,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';

const Calendar = () => {
  // Use current date instead of hardcoded 2025-05-22
  const today = new Date(); 
  today.setHours(0, 0, 0, 0);
  const navigate = useNavigate();

  // Check user role based on cookies
  const teacherLoggedIn = document.cookie.includes("teacherToken");
  const adminLoggedIn = document.cookie.includes("adminToken");
  const studentLoggedIn = document.cookie.includes("studentToken");

  const [selectedDate, setSelectedDate] = useState(today);
  const [allNoticesForSelectedDate, setAllNoticesForSelectedDate] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [calendarMatrix, setCalendarMatrix] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [noticesForMonth, setNoticesForMonth] = useState({}); 
  const [currentNoticePage, setCurrentNoticePage] = useState(1);
  const [hoverDay, setHoverDay] = useState(null);
  const noticesPerPage = 5;
  const [fetchError, setFetchError] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const parseDateString = useCallback((dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const parts = dateStr.substring(0, 10).split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setHours(0,0,0,0);
      return d;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    d.setHours(0,0,0,0); 
    return d;
  }, []);

  const generateCalendar = useCallback((year, month) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let matrix = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      matrix.push(week);
      if (day > daysInMonth && matrix[matrix.length - 1].every(d => d === null)) {
         matrix.pop(); 
      }
      if (day > daysInMonth) break;
    }
    setCalendarMatrix(matrix);
  }, []);
  
  const fetchNoticesForMonthIndicators = useCallback(async (year, month) => {
    try {
      console.log(`Fetching notices for month: ${month+1}/${year}`);
      setFetchError(null);
      const response = await axios.get(getApiUrl('/api/calendar'), { withCredentials: true });
      console.log(`Received ${response.data.length} total notices from API`);
      
      const monthNoticesMap = {};
      
      if (!response.data || response.data.length === 0) {
        // No notices found - just use empty object instead of sample notices
        console.log('No notices found for this month');
      } else {
        // Process actual notices from the API
        (response.data || []).forEach(event => {
          // Filter notices based on user role
          if (!shouldShowNotice(event)) {
            return; // Skip this notice if it shouldn't be shown to current user
          }
          
          let eventDate = null;
          
          // Try to get a valid date from various date fields
          if (event.date) {
            eventDate = new Date(event.date);
          } else if (event.publishDate) {
            eventDate = new Date(event.publishDate);
          } else if (event.createdAt) {
            eventDate = new Date(event.createdAt);
          }
          
          if (!eventDate || isNaN(eventDate.getTime())) {
            console.log(`Invalid date for event: ${event.id || 'unknown'}`);
            return;
          }
          
          // Check if this notice belongs to the current month/year
          if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
            const day = eventDate.getDate();
            if (!monthNoticesMap[day]) {
              monthNoticesMap[day] = [];
            }
            
            monthNoticesMap[day].push({
              id: event.id,
              title: event.title,
              content: event.content,
              date: eventDate,
              forTeachers: event.forTeachers,
              forStudents: event.forStudents,
              createdAt: event.createdAt || event.publishDate || eventDate
            });
            
            console.log(`Added notice for day ${day}: ${event.title}`);
          }
        });
        
        // Sort notices within each day by creation date (newest first)
        Object.keys(monthNoticesMap).forEach(day => {
          monthNoticesMap[day].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
        });
      }
      
      setNoticesForMonth(monthNoticesMap);
    } catch (error) {
      console.error("Error fetching notices for month indicators:", error);
      setFetchError("Failed to load notices. Please try again later.");
      
      // Provide sample data for the current day in case of error
      const currentDate = new Date();
      const day = currentDate.getDate();
      if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
        setNoticesForMonth({
          [day]: [{
            id: 'sample-error-1',
            title: 'Notice Loading Failed',
            content: 'There was an issue loading notices'
          }]
        });
      } else {
        setNoticesForMonth({});
      }
    }
  }, []);

  // Helper function to determine if a notice should be shown based on user role
  const shouldShowNotice = useCallback((notice) => {
    if (adminLoggedIn) return true; // Admins see all notices
    if (teacherLoggedIn) return notice.forTeachers || (!notice.forTeachers && !notice.forStudents); // Teachers see teacher notices and public notices
    if (studentLoggedIn) return notice.forStudents || (!notice.forTeachers && !notice.forStudents); // Students see student notices and public notices
    return !notice.forTeachers && !notice.forStudents; // Public users see only public notices (both flags false)
  }, [adminLoggedIn, teacherLoggedIn, studentLoggedIn]);

  const fetchNoticesForSelectedDate = useCallback(async (dateObj) => {
    if (!dateObj) {
      setAllNoticesForSelectedDate([]);
      setLoadingNotices(false);
      setCurrentNoticePage(1);
      return;
    }
    
    setLoadingNotices(true);
    setCurrentNoticePage(1); // Reset to first page for new date
    
    try {
      const response = await axios.get(getApiUrl('/api/calendar'), { withCredentials: true });
      console.log(`Received ${response.data.length} total notices from API`);
      
      // Get selected date components for exact day comparison
      const selectedYear = dateObj.getFullYear();
      const selectedMonth = dateObj.getMonth();
      const selectedDay = dateObj.getDate();
      
      console.log(`Filtering notices for exact date: ${selectedYear}-${selectedMonth+1}-${selectedDay}`);
      
      // If no notices found or API returns empty, create sample notices for today
      if (!response.data || response.data.length === 0) {
        // Check if selected date is today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (today.getFullYear() === selectedYear && 
            today.getMonth() === selectedMonth && 
            today.getDate() === selectedDay) {
          setAllNoticesForSelectedDate([{
            id: 'sample-1',
            title: 'School Activities',
            content: 'Regular school activities today',
            createdAt: new Date().toISOString(),
            audience: { teachers: true, students: true },
            forTeachers: true,
            forStudents: true
          }]);
        } else {
          setAllNoticesForSelectedDate([]);
        }
        setLoadingNotices(false);
        return;
      }
      
      // Filter notices for the selected date with strict day matching
      const filtered = (response.data || []).filter(event => {
        // Apply role-based filtering
        if (!shouldShowNotice(event)) {
          return false;
        }
        
        // Try all possible date fields
        let eventDate = null;
        
        if (event.date) {
          eventDate = new Date(event.date);
        } else if (event.publishDate) {
          eventDate = new Date(event.publishDate);
        } else if (event.createdAt) {
          eventDate = new Date(event.createdAt);
        }
        
        if (!eventDate || isNaN(eventDate.getTime())) {
          return false;
        }
        
        // Strict comparison by year, month, and day components
        return eventDate.getFullYear() === selectedYear && 
               eventDate.getMonth() === selectedMonth && 
               eventDate.getDate() === selectedDay;
      });
      
      // Sort notices by creation date (newest first)
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.publishDate || a.date);
        const dateB = new Date(b.createdAt || b.publishDate || b.date);
        return dateB - dateA;
      });
      
      console.log(`Found ${filtered.length} notices for selected date after role filtering`);
      setAllNoticesForSelectedDate(filtered);
    } catch (error) {
      console.error(`Error fetching notices for date:`, error);
      setAllNoticesForSelectedDate([]);
    } finally {
      setLoadingNotices(false);
    }
  }, [shouldShowNotice]);

  useEffect(() => {
    generateCalendar(currentYear, currentMonth);
    fetchNoticesForMonthIndicators(currentYear, currentMonth);
  }, [currentMonth, currentYear, generateCalendar, fetchNoticesForMonthIndicators]);

  useEffect(() => {
    if (selectedDate) {
      fetchNoticesForSelectedDate(selectedDate);
    }
  }, [selectedDate, fetchNoticesForSelectedDate]);
  
  const handleDateClick = (day) => {
    if (!day) return;
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0,0,0,0);
    setSelectedDate(date);
  };

  const goToToday = () => {
    const localToday = new Date(); 
    localToday.setHours(0,0,0,0);
    setCurrentMonth(localToday.getMonth());
    setCurrentYear(localToday.getFullYear());
    setSelectedDate(localToday);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setSelectedDate(null); // Clear selected date when changing month
    setAllNoticesForSelectedDate([]); // Clear notices
  };

  // Use full names for Nepali week (Sunday-Saturday)
  const daysOfWeek = [
    { id: 'sunday', label: 'Sunday' },
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' }
  ];

  // Pagination logic
  const indexOfLastNotice = currentNoticePage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNoticesToDisplay = allNoticesForSelectedDate.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalNoticePages = Math.ceil(allNoticesForSelectedDate.length / noticesPerPage);

  const paginateNotices = (pageNumber) => setCurrentNoticePage(pageNumber);
  
  // Get time ago string
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffDays > 30) {
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    }
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHr > 0) {
      return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  // Format date for header
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Get icon for notice based on title/content - just a visual enhancement
  const getNoticeIcon = (notice) => {
    const title = (notice.title || '').toLowerCase();
    if (title.includes('exam') || title.includes('test')) return <FaBook />;
    if (title.includes('meeting') || title.includes('assembly')) return <FaUserFriends />;
    if (title.includes('event')) return <FaStar />;
    if (title.includes('class')) return <FaGraduationCap />;
    if (title.includes('location') || title.includes('place')) return <FaMapMarkerAlt />;
    if (title.includes('setting') || title.includes('update')) return <FaCog />;
    return <FaCheckCircle />;
  };

  const redirectToNotice = () => {
    // Navigate to the notice page
    navigate('/notice');
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] p-2 sm:p-4 md:p-6 flex flex-col items-center">
      {/* Header with Glass Effect */}
      <div className="w-full max-w-6xl mb-4 sm:mb-6">
        <div className="backdrop-blur-sm bg-white/90 rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="bg-gradient-to-r from-[#0a66c2] to-[#0077b5] text-white p-2 rounded-lg mr-3">
              <FaRegCalendarAlt className="text-xl sm:text-2xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#191919]">
              Calendar
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={goToToday} 
              className="px-3 py-1.5 text-xs font-medium text-[#0a66c2] bg-white hover:bg-[#e8f3ff] border border-[#0a66c2] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:ring-opacity-50"
            >
              Today
            </button>
            
            <div className="flex items-center bg-white rounded-md border border-gray-300 shadow-sm">
              <button 
                onClick={() => changeMonth(-1)} 
                className="p-1.5 text-gray-500 hover:text-[#0a66c2] hover:bg-[#e8f3ff] rounded-l-md focus:outline-none"
              >
                <FaChevronLeft size={14} />
              </button>
              <span className="text-sm font-medium text-[#191919] px-2">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button 
                onClick={() => changeMonth(1)} 
                className="p-1.5 text-gray-500 hover:text-[#0a66c2] hover:bg-[#e8f3ff] rounded-r-md focus:outline-none"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
            
            <div className="hidden sm:flex items-center bg-[#e8f3ff] text-[#0a66c2] rounded-full px-3 py-1 text-xs">
              <FaInfoCircle className="mr-1" size={12} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {fetchError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaRegSadCry className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{fetchError}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-7 border-b">
            {daysOfWeek.map((day) => (
              <div 
                key={day.id} 
                className={`py-2 text-center text-xs font-medium ${day.id === 'saturday' ? 'text-red-600' : 'text-[#666666]'}`}
              >
                {day.label}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 h-[calc(65vh-120px)]">
            {calendarMatrix.flat().map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="border-r border-b border-gray-100"></div>;
              }
              const dateObj = new Date(currentYear, currentMonth, day);
              dateObj.setHours(0, 0, 0, 0);
              const isCurrentSelectedDate = selectedDate && dateObj.getTime() === selectedDate.getTime();
              const isTodayDate = dateObj.getTime() === today.getTime();
              const hasNoticesForDay = noticesForMonth[day] && noticesForMonth[day].length > 0;
              const dayOfWeek = dateObj.getDay();
              const isSaturday = dayOfWeek === 6;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isHovering = hoverDay === day;
              return (
                <div
                  key={`${currentYear}-${currentMonth}-${day}`}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoverDay(day)}
                  onMouseLeave={() => setHoverDay(null)}
                  className={`
                    relative border-r border-b border-gray-100 min-h-[80px] transition-all duration-200 cursor-pointer
                    ${isCurrentSelectedDate ? 'bg-[#e8f3ff]' : isSaturday ? 'bg-red-50' : isWeekend ? 'bg-[#f9fafb]' : 'hover:bg-gray-50'}
                    ${isHovering ? 'shadow-md transform scale-[1.02] z-10' : ''}
                  `}
                >
                  <div className={`
                    flex justify-center items-center w-7 h-7 mx-auto mt-1 text-sm font-medium rounded-full
                    ${isTodayDate ? 'bg-[#0a66c2] text-white' :
                      isCurrentSelectedDate ? 'text-[#0a66c2] border-2 border-[#0a66c2]' :
                      isSaturday ? 'text-red-600' :
                      isWeekend ? 'text-[#0a66c2]' : 'text-[#666666]'}
                  `}>
                    {/* Day number with indicators for notices */}
                    <div className="flex flex-col items-center">
                      <span className={`text-sm ${isTodayDate ? 'font-bold' : ''}`}>{day}</span>
                      
                      {/* Notice indicators */}
                      {noticesForMonth[day] && (
                        <div className="flex gap-0.5 mt-1">
                          {noticesForMonth[day].length > 0 && (
                            <div className="flex flex-wrap justify-center gap-0.5">
                              {noticesForMonth[day].slice(0, 3).map((notice, i) => (
                                <span
                                  key={`${day}-${i}`}
                                  className={`block w-1.5 h-1.5 rounded-full ${
                                    i === 0 ? 'bg-[#0a66c2]' : 
                                    i === 1 ? 'bg-[#0077b5]' : 
                                    'bg-[#0096d6]'
                                  }`}
                                  title={notice.title}
                                ></span>
                              ))}
                              {noticesForMonth[day].length > 3 && (
                                <span className="text-xs text-[#0a66c2] font-medium ml-0.5">
                                  +{noticesForMonth[day].length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {hasNoticesForDay && (
                    <div 
                      className={`mt-2 flex flex-col items-center ${
                        isHovering 
                          ? 'opacity-100 translate-y-0 scale-105 z-10' 
                          : 'opacity-85 translate-y-1 scale-100'
                      } transition-all duration-300 ease-in-out`}
                    >
                      {noticesForMonth[day].slice(0, 2).map((notice, idx) => (
                        <div 
                          key={notice.id || idx}
                          className={`w-4/5 py-1 px-1 text-[10px] rounded-md text-white bg-[#0a66c2] truncate text-center mb-1 ${
                            isHovering 
                              ? 'shadow-lg transform transition-transform duration-300 ease-out notice-glow' 
                              : ''
                          }`}
                          title={notice.title}
                        >
                          {notice.title}
                        </div>
                      ))}
                      {noticesForMonth[day].length > 2 && (
                        <div className="text-xs text-[#0a66c2] font-medium">
                          +{noticesForMonth[day].length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Selected Day Details */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#0a66c2] to-[#0077b5] text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {selectedDate ? formatDate(selectedDate) : 'Select a Date'}
              </h3>
            </div>
          </div>
          
          <div className="p-4 h-[calc(65vh-74px)] overflow-y-auto">
            {loadingNotices ? (
              <div className="flex flex-col items-center justify-center py-10">
                <FaSpinner className="animate-spin text-[#0a66c2] mb-2" size={24} />
                <p className="text-sm text-gray-500">Loading notices...</p>
              </div>
            ) : !selectedDate ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FaRegCalendarAlt className="text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 mb-1">No date selected</p>
                <p className="text-sm text-gray-400">Click on a date to view notices</p>
              </div>
            ) : allNoticesForSelectedDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FaRegBell className="text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 mb-1">No notices for this date</p>
                <p className="text-sm text-gray-400">Check back later or select another date</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notices for this date</h4>
                  <div className="h-1 w-20 bg-[#0a66c2] rounded-full"></div>
                </div>
                
                <div className="space-y-3">
                  {currentNoticesToDisplay.map((notice) => (
                    <div 
                      key={notice.id} 
                      className="bg-[#f9fafb] rounded-lg p-3 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-[#0a66c2] cursor-pointer"
                      onClick={redirectToNotice}
                    >
                      <div className="mb-2 flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="bg-[#e8f3ff] text-[#0a66c2] p-1.5 rounded-md mr-2">
                            {getNoticeIcon(notice)}
                          </div>
                          <h5 className="font-medium text-[#191919] text-sm line-clamp-2">
                            {notice.title}
                          </h5>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {notice.content.replace(/\n/g, ' ')}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <FaClock className="mr-1" size={10} />
                          <span>{getTimeAgo(notice.createdAt || notice.publishDate || selectedDate)}</span>
                        </div>
                        
                        <div className="flex space-x-1">
                          {(notice.audience?.teachers || notice.forTeachers) && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px]">
                              Teachers
                            </span>
                          )}
                          {(notice.audience?.students || notice.forStudents) && (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px]">
                              Students
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalNoticePages > 1 && (
                  <div className="flex justify-center mt-4">
                    {Array.from({ length: totalNoticePages }, (_, i) => (
                      <button
                        key={i}
                        className={`mx-1 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          currentNoticePage === i + 1
                            ? 'bg-[#0a66c2] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => paginateNotices(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* View All Button */}
                <button
                  onClick={redirectToNotice}
                  className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-[#0a66c2] to-[#0077b5] text-white text-sm font-medium flex items-center justify-center transition-transform duration-200 hover:shadow-md hover:translate-y-[-2px]"
                >
                  View All Notices
                  <FaArrowRight className="ml-2" size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Admin Event Creation Form */}
      {adminLoggedIn && (
        <div className="w-full max-w-6xl mb-4">
          <div className="backdrop-blur-sm bg-white/90 rounded-xl shadow-lg p-4">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg mr-3">
                <FaRegBell className="text-lg" />
              </div>
              <h2 className="text-lg font-semibold text-[#191919]">
                Create Calendar Event
              </h2>
            </div>
            <EventCreationForm onEventCreated={() => {
              // Refresh calendar data when event is created
              fetchNoticesForMonthIndicators(currentYear, currentMonth);
              if (selectedDate) {
                fetchNoticesForSelectedDate(selectedDate);
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Event Creation Form Component for Admins
const EventCreationForm = ({ onEventCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    content: '',
    eventDate: '',
    audienceType: 'Public',
    expiryDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        getApiUrl('/api/calendar-events'),
        eventData,
        { withCredentials: true }
      );
      
      if (response.status === 201) {
        // Reset form
        setEventData({
          title: '',
          content: '',
          eventDate: '',
          audienceType: 'Public',
          expiryDate: ''
        });
        setIsExpanded(false);
        onEventCreated && onEventCreated();
        alert('Event created successfully!');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <FaRegBell />
        <span>Add New Calendar Event</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Date *
          </label>
          <input
            type="date"
            value={eventData.eventDate}
            onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Description *
        </label>
        <textarea
          value={eventData.content}
          onChange={(e) => setEventData({ ...eventData, content: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audience
          </label>
          <select
            value={eventData.audienceType}
            onChange={(e) => setEventData({ ...eventData, audienceType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="Public">Public (Everyone)</option>
            <option value="Teachers">Teachers Only</option>
            <option value="Students">Students Only</option>
            <option value="All">Teachers & Students</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date (Optional)
          </label>
          <input
            type="date"
            value={eventData.expiryDate}
            onChange={(e) => setEventData({ ...eventData, expiryDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
          <span>{isSubmitting ? 'Creating...' : 'Create Event'}</span>
        </button>
        
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Calendar;