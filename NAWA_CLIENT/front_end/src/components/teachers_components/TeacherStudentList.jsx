import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faUserGraduate, 
  faSpinner, 
  faGraduationCap,
  faUsers,
  faChalkboardTeacher
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TeacherStudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const classes = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];
  useEffect(() => {
    fetchStudents();
  }, [currentPage, selectedClass, selectedSection, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(selectedClass !== 'all' && { grade: selectedClass }),
        ...(selectedSection !== 'all' && { section: selectedSection }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(getApiUrl(`/api/teacher/students?${params}`), {
        withCredentials: true
      });

      setStudents(response.data.students || []);
      setTotalCount(response.data.totalCount || 0);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  const handleClassChange = (className) => {
    setSelectedClass(className);
    setSelectedSection('all'); // Reset section when class changes
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSectionChange = (section) => {
    setSelectedSection(section);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getClassCount = (grade) => {
    return students.filter(student => student.grade === grade).length;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const StudentCard = ({ student, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
            {student.name}
          </h3>          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-500" />
              Class {student.grade}
              {student.section && (
                <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                  {student.section}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          ID: {student.id}
        </div>
      </div>
    </motion.div>
  );

  const StudentRow = ({ student, index }) => (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="hover:bg-blue-50 transition-colors border-b border-gray-100"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{student.name}</span>
        </div>      </td>
      <td className="px-6 py-4 text-gray-700">
        <div className="flex items-center gap-2">
          {student.grade}
        </div>
      </td>
      <td className="px-6 py-4 text-gray-700">
        {student.section ? (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
            {student.section}
          </span>
        ) : (
          <span className="text-gray-400 italic text-xs">No section</span>
        )}
      </td>
      <td className="px-6 py-4 text-gray-500 text-sm">{student.id}</td>
    </motion.tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
                <p className="text-gray-600">View student information and class details</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                <span>{totalCount} Total Students</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>            {/* Class and Section Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Classes</option>
                  {classes.map(className => (
                    <option key={className} value={className}>
                      Class {className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={selectedClass === 'all'}
                >
                  <option value="all">All Sections</option>
                  {[...new Set(students.filter(s => selectedClass === 'all' || s.grade === selectedClass).map(s => s.section).filter(Boolean))].sort().map(section => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </motion.div>

        {/* Students Display */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchStudents}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {students.map((student, index) => (
                    <StudentCard key={student.id} student={student} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Section</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {students.map((student, index) => (
                        <StudentRow key={student.id} student={student} index={index} />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {students.length === 0 && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FontAwesomeIcon icon={faUserGraduate} className="text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedClass !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No students are currently enrolled.'}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentList;
