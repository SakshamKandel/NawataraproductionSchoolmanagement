import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import '../styles/calendar.css';
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight,
  Plus,
  X,
  Clock,
  Users,
  MapPin,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Star,
  Bell,
  Edit,
  Trash2,
  Eye,
  Settings,
  Check,
  MoreHorizontal
} from 'lucide-react';

const EnhancedCalendar = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const navigate = useNavigate();

  // Check user role based on cookies
  const teacherLoggedIn = document.cookie.includes("teacherToken");
  const adminLoggedIn = document.cookie.includes("adminToken");
  const studentLoggedIn = document.cookie.includes("studentToken");

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarMatrix, setCalendarMatrix] = useState([]);
  const [eventsForMonth, setEventsForMonth] = useState({});  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showMoreEventsModal, setShowMoreEventsModal] = useState(false);
  const [moreEventsDate, setMoreEventsDate] = useState(null);
  const [moreEventsList, setMoreEventsList] = useState([]);
  const [selectedEventsForDelete, setSelectedEventsForDelete] = useState([]);
  const [testMode, setTestMode] = useState(false); // For testing without login

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    content: '',
    eventDate: '',
    endDate: '',
    audienceType: 'Public',
    eventType: 'event',
    expiryDate: ''
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];  const eventTypeConfig = {
    notice: { 
      color: 'bg-slate-600', 
      icon: Bell, 
      label: 'Notice',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200',
      gradient: 'from-slate-500 to-slate-600',
      lightBg: 'bg-slate-50',
      darkText: 'text-slate-800'
    },
    event: { 
      color: 'bg-blue-600', 
      icon: CalendarIcon, 
      label: 'Event',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      darkText: 'text-blue-800'
    },
    holiday: { 
      color: 'bg-rose-500', 
      icon: Star, 
      label: 'Holiday',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      gradient: 'from-rose-500 to-rose-600',
      lightBg: 'bg-rose-50',
      darkText: 'text-rose-800'
    },
    exam: { 
      color: 'bg-orange-500', 
      icon: BookOpen, 
      label: 'Exam',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
      darkText: 'text-orange-800'
    },
    meeting: { 
      color: 'bg-green-600', 
      icon: Users, 
      label: 'Meeting',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      gradient: 'from-green-500 to-green-600',
      lightBg: 'bg-green-50',
      darkText: 'text-green-800'
    }
  };

  // Generate calendar matrix
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
      if (day > daysInMonth) break;
    }
    setCalendarMatrix(matrix);
  }, []);

  // Check if a date is within an event's range
  const isDateInEventRange = (date, event) => {
    const eventStart = new Date(event.date || event.publishDate);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
    
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(23, 59, 59, 999);
    
    return date >= eventStart && date <= eventEnd;
  };
  // Get events for a specific date
  const getEventsForDate = (year, month, day) => {
    // Simply return the events already stored for this day
    return eventsForMonth[day] || [];
  };

  // Check if event should be shown based on user role
  const shouldShowEvent = useCallback((event) => {
    if (adminLoggedIn) return true;
    if (teacherLoggedIn) return event.forTeachers || (!event.forTeachers && !event.forStudents);
    if (studentLoggedIn) return event.forStudents || (!event.forTeachers && !event.forStudents);
    return !event.forTeachers && !event.forStudents;
  }, [adminLoggedIn, teacherLoggedIn, studentLoggedIn]);
  // Fetch events for month
  const fetchEventsForMonth = useCallback(async (year, month) => {
    setLoading(true);
    try {
      const response = await axios.get(getApiUrl('/api/calendar'), { 
        withCredentials: true 
      });
      
      const monthEventsMap = {};
        (response.data || []).forEach(event => {
        if (!shouldShowEvent(event)) return;
        
        // For multi-day events, add to each day in the range
        const startDate = new Date(event.date || event.publishDate);
        const endDate = event.endDate ? new Date(event.endDate) : startDate;
        
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getFullYear() === year && currentDate.getMonth() === month) {
            const day = currentDate.getDate();
            if (!monthEventsMap[day]) {
              monthEventsMap[day] = [];
            }
            
            // Check if this exact event already exists for this day (prevent duplicates)
            const eventKey = `${event.id}-${currentDate.getTime()}`;
            const existingEvent = monthEventsMap[day].find(existingEvent => 
              existingEvent.id === event.id && existingEvent.eventKey === eventKey
            );
            
            if (!existingEvent) {
              // Add event info about whether it's start, middle, or end of multi-day event
              const eventWithPosition = {
                ...event,
                eventKey,
                isStart: currentDate.getTime() === startDate.getTime(),
                isEnd: currentDate.getTime() === endDate.getTime(),
                isMultiDay: startDate.getTime() !== endDate.getTime()
              };
              
              monthEventsMap[day].push(eventWithPosition);
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
      
      setEventsForMonth(monthEventsMap);
      // Remove success toast to prevent spam - events load silently
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [shouldShowEvent]);// Fetch events for selected date
  const fetchEventsForSelectedDate = useCallback((date) => {
    if (!date) {
      setSelectedEvents([]);
      return;
    }
    
    const events = getEventsForDate(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedEvents(events);
  }, [eventsForMonth]);

  // Navigation functions
  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  // Event form handlers
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        getApiUrl('/api/calendar-events'),
        eventForm,
        { withCredentials: true }
      );
      
      if (response.status === 201) {
        toast.success('Event created successfully!');
        setEventForm({
          title: '',
          content: '',
          eventDate: '',
          endDate: '',
          audienceType: 'Public',
          eventType: 'event',
          expiryDate: ''
        });
        setShowEventForm(false);
        fetchEventsForMonth(currentYear, currentMonth);
        if (selectedDate) {
          fetchEventsForSelectedDate(selectedDate);
        }
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Click handlers
  const handleDateClick = (day) => {
    if (!day) return;
    
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
    fetchEventsForSelectedDate(clickedDate);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleMoreEventsClick = (day) => {
    const events = getEventsForDate(currentYear, currentMonth, day);
    setMoreEventsList(events);
    setMoreEventsDate(new Date(currentYear, currentMonth, day));
    setShowMoreEventsModal(true);
    setSelectedEventsForDelete([]);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await axios.delete(
        getApiUrl(`/api/calendar-events/${eventId}`),
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        toast.success('Event deleted successfully!');
        fetchEventsForMonth(currentYear, currentMonth);
        if (selectedDate) {
          fetchEventsForSelectedDate(selectedDate);
        }
        // Update the more events list
        const updatedEvents = moreEventsList.filter(event => event.id !== eventId);
        setMoreEventsList(updatedEvents);
        // Remove from selected for delete
        setSelectedEventsForDelete(prev => prev.filter(id => id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.');
    }
  };
  const handleBulkDelete = async (eventIds = null) => {
    const eventsToDelete = eventIds || selectedEventsForDelete;
    
    if (eventsToDelete.length === 0) {
      toast.error('Please select events to delete');
      return;
    }

    try {
      const deletePromises = eventsToDelete.map(eventId =>
        axios.delete(getApiUrl(`/api/calendar-events/${eventId}`), { withCredentials: true })
      );

      await Promise.all(deletePromises);
      
      toast.success(`${eventsToDelete.length} event${eventsToDelete.length > 1 ? 's' : ''} deleted successfully!`);
      fetchEventsForMonth(currentYear, currentMonth);
      if (selectedDate) {
        fetchEventsForSelectedDate(selectedDate);
      }
      // Update the more events list if modal is open
      if (showMoreEventsModal) {
        const updatedEvents = moreEventsList.filter(event => !eventsToDelete.includes(event.id));
        setMoreEventsList(updatedEvents);
        
        // Close modal if no events left
        if (updatedEvents.length === 0) {
          setShowMoreEventsModal(false);
        }
      }
      setSelectedEventsForDelete([]);
    } catch (error) {
      console.error('Error deleting events:', error);
      toast.error('Failed to delete some events. Please try again.');
    }
  };

  const toggleEventSelection = (eventId) => {
    setSelectedEventsForDelete(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  // Effects
  useEffect(() => {
    generateCalendar(currentYear, currentMonth);
    fetchEventsForMonth(currentYear, currentMonth);
  }, [currentMonth, currentYear, generateCalendar, fetchEventsForMonth]);

  useEffect(() => {
    if (selectedDate) {
      fetchEventsForSelectedDate(selectedDate);
    }
  }, [selectedDate, fetchEventsForSelectedDate]);  return (
    <div className="min-h-screen bg-neutral-50">
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-700 text-white p-3 rounded-lg shadow-sm">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">School Calendar</h1>
                <p className="text-gray-600 text-sm">Manage events, notices, and important dates</p>
              </div>
            </div>            
            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm"
              >
                Today
              </button>
              
              <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-50 text-gray-600 hover:text-blue-700 transition-colors duration-200 rounded-l-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 font-semibold text-gray-900 min-w-[150px] text-center text-sm border-l border-r border-gray-200 bg-gray-25">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-50 text-gray-600 hover:text-blue-700 transition-colors duration-200 rounded-r-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {adminLoggedIn && (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Event</span>
                </button>
              )}
            </div>
          </div>
        </motion.div><div className="grid grid-cols-1 xl:grid-cols-4 gap-6">          {/* Calendar Grid */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center text-gray-700 font-semibold text-sm bg-gray-50">
                  <span className="hidden sm:inline">{day}day</span>
                  <span className="sm:hidden">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7">
              {calendarMatrix.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const isToday = day && 
                    currentYear === today.getFullYear() && 
                    currentMonth === today.getMonth() && 
                    day === today.getDate();
                  
                  const isSelected = day && selectedDate &&
                    currentYear === selectedDate.getFullYear() && 
                    currentMonth === selectedDate.getMonth() && 
                    day === selectedDate.getDate();
                  
                  const dayEvents = day ? getEventsForDate(currentYear, currentMonth, day) : [];
                  
                  // Additional duplicate filtering by id and title
                  const uniqueEvents = dayEvents.filter((event, index, array) => 
                    array.findIndex(e => e.id === event.id && e.title === event.title) === index
                  );
                  
                  return (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      whileHover={{ scale: day ? 1.01 : 1 }}
                      className={`
                        aspect-square border-r border-b border-gray-200 cursor-pointer transition-all duration-200
                        ${day ? 'hover:bg-blue-25 hover:shadow-sm' : 'bg-gray-25'}
                        ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                        ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                      `}
                      onClick={() => handleDateClick(day)}
                    >
                      {day && (
                        <div className="p-2 h-full flex flex-col">
                          <div className={`
                            text-center font-semibold mb-2 text-sm
                            ${isToday ? 'text-white bg-blue-700 w-6 h-6 rounded-full flex items-center justify-center mx-auto shadow-sm' : 
                              isSelected ? 'text-blue-700 font-bold' : 'text-gray-700'}
                          `}>
                            {day}
                          </div>
                            <div className="flex-1 overflow-hidden space-y-1">                            {uniqueEvents.slice(0, 2).map((event, index) => {
                              const config = eventTypeConfig[event.eventType] || eventTypeConfig.notice;
                              return (
                                <motion.div
                                  key={`${event.eventKey || event.id}-${index}`}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`
                                    group relative text-xs px-2 py-1 rounded cursor-pointer truncate font-medium
                                    ${config.color} text-white shadow-sm
                                    hover:shadow-md transition-all duration-200
                                    ${event.isMultiDay ? (
                                      event.isStart ? 'rounded-r-sm' : 
                                      event.isEnd ? 'rounded-l-sm' : 
                                      'rounded-none'
                                    ) : ''}
                                  `}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  title={event.title}
                                >
                                  <span className="group-hover:pr-5 transition-all duration-200">
                                    {event.title}
                                  </span>
                                  {(adminLoggedIn || teacherLoggedIn) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEvent(event.id);
                                      }}
                                      className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 rounded-sm p-0.5"
                                      title="Delete Event"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </motion.div>
                              );
                            })}{uniqueEvents.length > 2 && (
                              <div 
                                className="text-xs text-gray-500 text-center font-medium bg-gray-100 hover:bg-gray-200 rounded-sm py-1 cursor-pointer transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoreEventsClick(day);
                                }}
                              >
                                +{uniqueEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>          {/* Events Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-700 text-white p-2 rounded-lg shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Select a date'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                </p>
              </div>              {adminLoggedIn && selectedEvents.length > 1 && (
                <button
                  onClick={() => {
                    const eventIds = selectedEvents.map(event => event.id);
                    handleBulkDelete(eventIds);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                  title="Delete All Events"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {selectedEvents.map((event, index) => {
                  const config = eventTypeConfig[event.eventType] || eventTypeConfig.notice;
                  const Icon = config.icon;
                  
                  return (                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors duration-200">
                            {event.title}
                          </h4>
                          <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                            {event.content}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-white font-medium shadow-sm`}>
                              {config.label}
                            </span>
                            {event.isMultiDay && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                                Multi-day
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {adminLoggedIn && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-700"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {selectedEvents.length === 0 && selectedDate && (
                <div className="text-center py-12 text-slate-500">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No events today</p>
                  <p className="text-sm">Select another date to view events</p>
                </div>
              )}
              
              {!selectedDate && (
                <div className="text-center py-12 text-slate-500">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a date</p>
                  <p className="text-sm">Click on any calendar day to view events</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>      {/* Event Creation Modal */}
      <AnimatePresence>
        {showEventForm && adminLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEventForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Create New Event</h2>
                  </div>
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200 text-slate-600 hover:text-slate-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleEventSubmit} className="p-6 space-y-6">                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-slate-400"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-slate-400"
                    >
                      {Object.entries(eventTypeConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={eventForm.content}
                    onChange={(e) => setEventForm({ ...eventForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-slate-400 resize-none"
                    placeholder="Enter event description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Audience
                    </label>
                    <select
                      value={eventForm.audienceType}
                      onChange={(e) => setEventForm({ ...eventForm, audienceType: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-slate-400"
                    >
                      <option value="Public">Public (Everyone)</option>
                      <option value="Teachers">Teachers Only</option>
                      <option value="Students">Students Only</option>
                      <option value="All">Teachers & Students</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={eventForm.expiryDate}
                      onChange={(e) => setEventForm({ ...eventForm, expiryDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-slate-400"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {loading ? 'Creating...' : 'Create Event'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl transition-colors duration-200 font-semibold shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>      {/* Event Details Modal */}
      <AnimatePresence>
        {showEventDetails && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEventDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = eventTypeConfig[selectedEvent.eventType] || eventTypeConfig.notice;
                      const Icon = config.icon;
                      return (
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      );
                    })()}
                    <h2 className="text-xl font-bold text-slate-800">{selectedEvent.title}</h2>
                  </div>
                  <button
                    onClick={() => setShowEventDetails(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200 text-slate-600 hover:text-slate-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">Description</h3>
                    <p className="text-slate-600 leading-relaxed">{selectedEvent.content}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <h3 className="font-semibold text-slate-700 mb-1 text-sm uppercase tracking-wide">Start Date</h3>
                      <p className="text-slate-800 font-medium">
                        {new Date(selectedEvent.date || selectedEvent.publishDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {selectedEvent.endDate && (
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <h3 className="font-semibold text-slate-700 mb-1 text-sm uppercase tracking-wide">End Date</h3>
                        <p className="text-slate-800 font-medium">
                          {new Date(selectedEvent.endDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const config = eventTypeConfig[selectedEvent.eventType] || eventTypeConfig.notice;
                      return (
                        <span className={`text-sm px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white font-medium shadow-sm`}>
                          {config.label}
                        </span>
                      );
                    })()}
                    {selectedEvent.forTeachers && (
                      <span className="text-sm px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                        Teachers
                      </span>
                    )}
                    {selectedEvent.forStudents && (
                      <span className="text-sm px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        Students
                      </span>
                    )}
                    {!selectedEvent.forTeachers && !selectedEvent.forStudents && (
                      <span className="text-sm px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-medium">
                        Public
                      </span>
                    )}
                    {selectedEvent.isMultiDay && (
                      <span className="text-sm px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                        Multi-day Event
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}      </AnimatePresence>

      {/* More Events Modal */}
      <AnimatePresence>
        {showMoreEventsModal && moreEventsDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMoreEventsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 text-white p-2 rounded-lg shadow-sm">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        Events for {moreEventsDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h2>
                      <p className="text-sm text-slate-600">
                        {moreEventsList.length} event{moreEventsList.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMoreEventsModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200 text-slate-600 hover:text-slate-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Bulk Actions */}
                {adminLoggedIn && moreEventsList.length > 0 && (
                  <div className="flex items-center justify-between mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (selectedEventsForDelete.length === moreEventsList.length) {
                            setSelectedEventsForDelete([]);
                          } else {
                            setSelectedEventsForDelete(moreEventsList.map(event => event.id));
                          }
                        }}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                      >
                        <div className={`w-4 h-4 border-2 border-slate-400 rounded ${
                          selectedEventsForDelete.length === moreEventsList.length ? 'bg-blue-600 border-blue-600' : ''
                        } flex items-center justify-center`}>
                          {selectedEventsForDelete.length === moreEventsList.length && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        Select All
                      </button>
                      <span className="text-sm text-slate-500">
                        {selectedEventsForDelete.length} selected
                      </span>
                    </div>
                    {selectedEventsForDelete.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {moreEventsList.map((event) => {
                    const config = eventTypeConfig[event.eventType] || eventTypeConfig.notice;
                    const Icon = config.icon;
                    const isSelected = selectedEventsForDelete.includes(event.id);

                    return (
                      <motion.div
                        key={event.eventKey || event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : `border-slate-200 ${config.lightBg} hover:border-slate-300`
                        }`}
                        onClick={() => {
                          if (adminLoggedIn || teacherLoggedIn) {
                            toggleEventSelection(event.id);
                          } else {
                            handleEventClick(event);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {(adminLoggedIn || teacherLoggedIn) && (
                              <div 
                                className={`w-5 h-5 border-2 border-slate-400 rounded mt-1 flex items-center justify-center ${
                                  isSelected ? 'bg-blue-600 border-blue-600' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEventSelection(event.id);
                                }}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            )}
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white shadow-sm`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${config.darkText} mb-1`}>
                                {event.title}
                              </h3>
                              <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                                {event.content}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-white font-medium`}>
                                  {config.label}
                                </span>
                                {event.isMultiDay && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                                    {event.isStart && 'Start'} 
                                    {!event.isStart && !event.isEnd && 'Continues'} 
                                    {event.isEnd && 'End'}
                                  </span>
                                )}
                                {event.forTeachers && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                                    Teachers
                                  </span>
                                )}
                                {event.forStudents && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                                    Students
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {adminLoggedIn && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-700"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {moreEventsList.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No events for this date</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedCalendar;
