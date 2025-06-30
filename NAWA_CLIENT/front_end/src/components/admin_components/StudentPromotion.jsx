import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faUsers, 
  faArrowRight, 
  faSpinner, 
  faDownload,
  faEye,
  faLock,
  faCheck,
  faExclamationTriangle,
  faChartBar,
  faShieldAlt,
  faUserGraduate,
  faFileExcel,
  faTimes,
  faSchool,
  faLevelUpAlt,
  faUserFriends,
  faAward,
  faCog,
  faCalendarAlt,
  faHome,
  faBaby,
  faChild,
  faUser,
  faBookOpen,
  faStar,
  faTrophy,
  faHeart,
  faInfoCircle,
  faPlay,
  faStop,
  faCheckCircle,
  faTimesCircle,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const StudentPromotion = () => {
  const [classSummary, setClassSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [password, setPassword] = useState('');
  const [promotionType, setPromotionType] = useState('');
  const [processing, setProcessing] = useState(false);
  const [graduatedFiles, setGraduatedFiles] = useState([]);
  const [showGraduatedModal, setShowGraduatedModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Enhanced mock data with realistic student counts
  const mockClassSummary = [
    { currentClass: 'Nursery', nextClass: 'L.K.G.', studentCount: 25, canPromote: true },
    { currentClass: 'L.K.G.', nextClass: 'U.K.G.', studentCount: 28, canPromote: true },
    { currentClass: 'U.K.G.', nextClass: '1', studentCount: 30, canPromote: true },
    { currentClass: '1', nextClass: '2', studentCount: 32, canPromote: true },
    { currentClass: '2', nextClass: '3', studentCount: 29, canPromote: true },
    { currentClass: '3', nextClass: '4', studentCount: 31, canPromote: true },
    { currentClass: '4', nextClass: '5', studentCount: 27, canPromote: true },
    { currentClass: '5', nextClass: '6', studentCount: 26, canPromote: true },
    { currentClass: '6', nextClass: 'GRADUATED', studentCount: 24, canPromote: true }
  ];

  const mockStudentNames = {
    'Nursery': ['Aarav Sharma', 'Anisha Thapa', 'Bibek Rai', 'Sita Gurung', 'Rohan Magar', 'Priya Poudel'],
    'L.K.G.': ['Priya Singh', 'Arjun Shrestha', 'Maya Poudel', 'Kiran Tamang', 'Nisha KC', 'Anil Bhatta'],
    'U.K.G.': ['Deepak Karki', 'Sunita Bhandari', 'Rajesh Acharya', 'Kamala Lama', 'Suresh Rijal', 'Rita Sharma'],
    '1': ['Binod Gautam', 'Geeta Pandey', 'Ramesh Adhikari', 'Laxmi Dahal', 'Mohan Bhatta', 'Sita Gurung'],
    '2': ['Sagar Limbu', 'Ritu Joshi', 'Naresh Chhetri', 'Puja Basnet', 'Krishna Baral', 'Mina KC'],
    '3': ['Bikash Thakur', 'Sarita Oli', 'Mahesh Regmi', 'Sunita Shah', 'Dinesh Khadka', 'Kamala Magar'],
    '4': ['Rohit Maharjan', 'Sabina Manandhar', 'Prakash Shahi', 'Radha Koirala', 'Sunil Ghimire', 'Maya Tamang'],
    '5': ['Amrit Kafle', 'Urmila Devkota', 'Santosh Pokhrel', 'Kamana Subedi', 'Rajan Upreti', 'Gita Pun'],
    '6': ['Dipesh Dhakal', 'Saraswoti Giri', 'Ashok Pandey', 'Bishnu Karmacharya', 'Lila Chaudhary', 'Narayan Rai']
  };

  useEffect(() => {
    fetchClassSummary();
    fetchGraduatedFiles();
  }, []);

  const fetchClassSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/api/admin/promotion/class-summary'), {
        withCredentials: true
      });
      
      if (response.data.success) {
        setClassSummary(response.data.data);
        // Remove success toast to prevent spam - data loads silently
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching class summary:', error);
      setClassSummary(mockClassSummary);
      toast.error('🔗 Backend connection issue - Please check server status');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (className) => {
    try {
      const response = await axios.get(getApiUrl(`/api/admin/promotion/class/${className}/students`), {
        withCredentials: true
      });
      setClassStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching class students:', error);
      
      const students = mockStudentNames[className] || [];
      const mockStudents = {
        currentClass: className,
        nextClass: mockClassSummary.find(c => c.currentClass === className)?.nextClass || 'Unknown',
        totalStudents: students.length,
        students: students.map((name, index) => ({
          id: index + 1,
          name: name,
          currentClass: className,
          nextClass: mockClassSummary.find(c => c.currentClass === className)?.nextClass,
          fatherName: `Father of ${name.split(' ')[0]}`,
          motherName: `Mother of ${name.split(' ')[0]}`,
          contactNumber: `98000${String(index + 1).padStart(5, '0')}`,
          email: `${name.toLowerCase().replace(' ', '.')}@parent.com`
        }))
      };
      setClassStudents(mockStudents);
      toast.error('📊 Failed to load student data - Please try again');
    }
  };

  const fetchGraduatedFiles = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/admin/promotion/graduated-files'), {
        withCredentials: true
      });
      setGraduatedFiles(response.data.data);
    } catch (error) {
      console.error('Error fetching graduated files:', error);
      setGraduatedFiles([
        { fileName: 'graduated_students_2024.xlsx', year: 2024, count: 22, createdDate: new Date().toISOString(), size: 15360 },
        { fileName: 'graduated_students_2023.xlsx', year: 2023, count: 28, createdDate: new Date(2023, 11, 15).toISOString(), size: 18240 }
      ]);
    }
  };

  const handleViewStudents = (className) => {
    fetchClassStudents(className);
    setSelectedClass(className);
    setShowStudentsModal(true);
  };

  const handlePromoteSingleClass = (className) => {
    setSelectedClass(className);
    setPromotionType('single');
    setShowConfirmModal(true);
  };

  const handlePromoteAllClasses = () => {
    setPromotionType('all');
    setShowConfirmModal(true);
  };

  const showPasswordPrompt = () => {
    setShowConfirmModal(false);
    setShowPasswordModal(true);
  };

  const confirmPromotion = async () => {
    if (!password.trim()) {
      toast.error('❌ Please enter your password');
      return;
    }

    try {
      setProcessing(true);
      
      if (promotionType === 'single') {
        const response = await axios.post(getApiUrl('/api/admin/promotion/promote-class'), {
          className: selectedClass,
          password: password
        }, { withCredentials: true });
        
        if (response.data && response.data.success) {
          toast.success(`✅ Successfully promoted Class ${selectedClass} students!`);
          
          if (selectedClass === '6') {
            fetchGraduatedFiles();
          }
          
          // Reset form and refresh data
          fetchClassSummary();
          setShowPasswordModal(false);
          setPassword('');
          setSelectedClass(null);
          setClassStudents([]);
        } else {
          throw new Error(response.data?.message || 'Promotion failed');
        }
      } else if (promotionType === 'all') {
        const response = await axios.post(getApiUrl('/api/admin/promotion/promote-all'), {
          password: password
        }, { withCredentials: true });
        
        if (response.data && response.data.success) {
          toast.success('🎓 Successfully promoted all classes! Class 6 students graduated.');
          fetchGraduatedFiles();
          
          // Reset form and refresh data
          fetchClassSummary();
          setShowPasswordModal(false);
          setPassword('');
          setSelectedClass(null);
          setClassStudents([]);
        } else {
          throw new Error(response.data?.message || 'Promotion failed');
        }
      }
    } catch (error) {
      console.error('Error promoting students:', error);
      
      if (error.response?.status === 401) {
        toast.error('❌ Invalid password. Please try again.');
      } else if (error.response?.status === 403) {
        toast.error('❌ You do not have permission to perform this action.');
      } else if (error.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`❌ ${error.message}`);
      } else {
        toast.error('❌ Failed to promote students. Please check your connection and try again.');
      }
      
      setPassword('');
    } finally {
      setProcessing(false);
    }
  };

  const downloadGraduatedFile = async (fileName) => {
    try {
      window.open(getApiUrl(`/api/admin/promotion/graduated-files/${fileName}`), '_blank');
      toast.success('📥 Download started!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('⚠️ Download temporarily unavailable');
    }
  };

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(getApiUrl(`/api/students/${studentToDelete.id}`), {
        withCredentials: true
      });
      
      toast.success(`🗑️ Student ${studentToDelete.name} deleted successfully!`);
      
      // Refresh the student list
      fetchClassStudents(selectedClass);
      // Refresh class summary to update counts
      fetchClassSummary();
      
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('❌ Failed to delete student. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getClassColor = (className) => {
    const colors = {
      'Nursery': 'from-pink-400 via-pink-500 to-rose-500',
      'L.K.G.': 'from-purple-400 via-purple-500 to-violet-500',
      'U.K.G.': 'from-indigo-400 via-indigo-500 to-blue-600',
      '1': 'from-blue-400 via-blue-500 to-cyan-500',
      '2': 'from-cyan-400 via-cyan-500 to-teal-500',
      '3': 'from-teal-400 via-teal-500 to-emerald-500',
      '4': 'from-green-400 via-green-500 to-lime-500',
      '5': 'from-yellow-400 via-amber-500 to-orange-500',
      '6': 'from-orange-400 via-red-500 to-pink-500'
    };
    return colors[className] || 'from-gray-400 via-gray-500 to-gray-600';
  };

  const getClassIcon = (className) => {
    if (className === 'Nursery') return faBaby;
    if (['L.K.G.', 'U.K.G.'].includes(className)) return faChild;
    if (['1', '2', '3'].includes(className)) return faBookOpen;
    if (['4', '5'].includes(className)) return faUser;
    if (className === '6') return faGraduationCap;
    return faSchool;
  };

  const getTotalStudents = () => {
    return classSummary.reduce((total, classData) => total + classData.studentCount, 0);
  };

  const getClassLevel = (className) => {
    if (className === 'Nursery') return 'Pre-Primary';
    if (['L.K.G.', 'U.K.G.'].includes(className)) return 'Kindergarten';
    if (['1', '2', '3', '4', '5', '6'].includes(className)) return 'Primary';
    return 'Unknown';
  };

  // Utility function to format file names for display
  const formatFileName = (fileName) => {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.(xlsx|xls)$/i, '');
    
    // Replace underscores with spaces and format better
    return nameWithoutExt
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .replace(/(\d{4})/, ' ($1)')
      .replace(/(\d{13,})/, (match) => 
        ` - ${new Date(parseInt(match)).toLocaleDateString()}`
      );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4 max-w-md">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Student Data</h3>
          <p className="text-gray-500 text-center">Fetching the latest class information and student counts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      
      {/* Header Section - LinkedIn Style */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faLevelUpAlt} className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Promotion</h1>
                <p className="text-gray-600 mt-1">Manage student progression across all grade levels</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6 lg:mt-0">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Students</p>
                    <p className="text-2xl font-bold">{getTotalStudents()}</p>
                  </div>
                  <FontAwesomeIcon icon={faUsers} className="text-xl text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Classes</p>
                    <p className="text-2xl font-bold">{classSummary.length}</p>
                  </div>
                  <FontAwesomeIcon icon={faSchool} className="text-xl text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Academic Year</p>
                    <p className="text-2xl font-bold">{new Date().getFullYear()}</p>
                  </div>
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-xl text-purple-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions - LinkedIn Style */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Efficiently manage student promotions and graduations</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handlePromoteAllClasses}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <FontAwesomeIcon icon={faPlay} />
                <span>Promote All Classes</span>
              </button>
              
              <button
                onClick={() => setShowGraduatedModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <FontAwesomeIcon icon={faFileExcel} />
                <span>View Graduated Records</span>
              </button>
            </div>
          </div>
        </div>

        {/* Class Cards Grid - Professional Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classSummary.map((classData, index) => (
            <div key={classData.currentClass} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Class Header */}
              <div className={`bg-gradient-to-r ${getClassColor(classData.currentClass)} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={getClassIcon(classData.currentClass)} className="text-xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">{getClassLevel(classData.currentClass)}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Class {classData.currentClass}</h3>
                  <p className="text-white text-opacity-90">
                    {classData.studentCount} student{classData.studentCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Class Body */}
              <div className="p-6">
                {/* Promotion Flow */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">Current</div>
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="font-bold text-gray-700">{classData.currentClass}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-lg" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">
                      {classData.nextClass === 'GRADUATED' ? 'Graduates' : 'Promotes to'}
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      classData.nextClass === 'GRADUATED' 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {classData.nextClass === 'GRADUATED' ? (
                        <FontAwesomeIcon icon={faUserGraduate} />
                      ) : (
                        <span className="font-bold">{classData.nextClass}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleViewStudents(classData.currentClass)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    <span>View {classData.studentCount} Students</span>
                  </button>
                  
                  {classData.canPromote && classData.studentCount > 0 ? (
                    <button
                      onClick={() => handlePromoteSingleClass(classData.currentClass)}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-white bg-gradient-to-r ${getClassColor(classData.currentClass)} hover:shadow-lg group-hover:scale-105`}
                    >
                      <FontAwesomeIcon icon={classData.nextClass === 'GRADUATED' ? faUserGraduate : faLevelUpAlt} />
                      <span>{classData.nextClass === 'GRADUATED' ? 'Graduate Class' : 'Promote Class'}</span>
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-500 text-center font-medium flex items-center justify-center space-x-2">
                      <FontAwesomeIcon icon={faStop} />
                      <span>No Students to Promote</span>
                    </div>
                  )}
                </div>

                {/* Next Class Info */}
                {classData.nextClass && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start space-x-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        {classData.nextClass === 'GRADUATED' 
                          ? 'Students will graduate and receive completion certificates'
                          : `Students will advance to Class ${classData.nextClass} in the new academic year`
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>      {/* Students Modal */}
      {showStudentsModal && (        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowStudentsModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-500 scale-100 animate-slideIn border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-r ${getClassColor(selectedClass)} p-6 text-white relative`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={getClassIcon(selectedClass)} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Class {classStudents.currentClass} Students</h3>
                    <p className="text-white text-opacity-90">
                      {classStudents.totalStudents} students ready for promotion to {
                        classStudents.nextClass === 'GRADUATED' ? 'graduation' : `Class ${classStudents.nextClass}`
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
                  title="Close"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-white text-lg" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96 p-6">
              {classStudents.students && classStudents.students.length > 0 ? (
                <div className="grid gap-4">
                  {classStudents.students.map((student, index) => (
                    <div key={student.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>                          <div>
                            <h4 className="font-semibold text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-600">
                              Father: {student.fatherName} • Contact: {student.contactNumber}
                              {student.section && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  Section {student.section}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Current: Class {student.currentClass}</p>
                            <p className="text-sm font-semibold text-green-600">
                              → {student.nextClass === 'GRADUATED' ? 'Graduation' : `Class ${student.nextClass}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                            title={`Delete ${student.name}`}
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-600">No students found in this class</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}      {/* Confirmation Modal */}
      {showConfirmModal && (        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowConfirmModal(false)}
        >
          <div 
            className="bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 scale-100 animate-slideIn border border-white border-opacity-30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 relative">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
                title="Close"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
              
              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Promotion</h3>
                <p className="text-gray-600">
                  {promotionType === 'single' 
                    ? `Are you sure you want to promote all students from Class ${selectedClass}?`
                    : 'Are you sure you want to promote ALL classes? This action cannot be undone.'
                  }
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showPasswordPrompt}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Password Modal */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => {
            setShowPasswordModal(false);
            setPassword('');
          }}
        >
          <div 
            className="bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 scale-100 animate-slideIn border border-white border-opacity-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 relative">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
                disabled={processing}
                title="Close"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
              
              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faLock} className="text-2xl text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Authentication</h3>
                <p className="text-gray-600">Enter your admin password to confirm the promotion</p>
              </div>
              
              <div className="mb-6">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={processing}
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPromotion}
                  disabled={processing || !password.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {processing ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Confirm Promotion
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Graduated Files Modal */}
      {showGraduatedModal && (        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowGraduatedModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full transform transition-all duration-500 scale-100 animate-slideIn border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 lg:p-8 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileExcel} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Graduated Students Files</h3>
                    <p className="text-purple-100">Download records of graduated students</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGraduatedModal(false)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
                  title="Close"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-white text-lg" />
                </button>
              </div>
            </div>
            
            <div className="p-6 lg:p-8">
              {graduatedFiles.length > 0 ? (
                <div className="space-y-3">
                  {graduatedFiles.map((file, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <FontAwesomeIcon icon={faFileExcel} className="text-green-600 text-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-semibold text-gray-900 text-sm lg:text-base leading-tight mb-1 break-words cursor-help"
                              title={file.fileName}
                            >
                              {formatFileName(file.fileName)}
                            </h4>
                            <p className="text-xs lg:text-sm text-gray-600">
                              Year {file.year} • {file.count} students
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => downloadGraduatedFile(file.fileName)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm lg:text-base shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <FontAwesomeIcon icon={faDownload} className="text-sm" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faFileExcel} className="text-2xl text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Files Available</h4>
                  <p className="text-gray-600">No graduated student files have been generated yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => !deleteLoading && setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faTrash} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Student</h3>
                  <p className="text-red-100">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {studentToDelete.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{studentToDelete.name}</h4>
                  <p className="text-sm text-gray-600">
                    Class {studentToDelete.currentClass || studentToDelete.grade}
                    {studentToDelete.section && ` - Section ${studentToDelete.section}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Father: {studentToDelete.fatherName}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Are you sure you want to delete this student?
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      This will permanently remove the student from the system including all related records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStudent}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Delete Student</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPromotion;
