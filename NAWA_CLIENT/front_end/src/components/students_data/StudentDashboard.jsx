import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUserGraduate, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getApiUrl } from '../../config/api.js';
import { renderError } from '../../utils/errorUtils.js';

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [error, setError] = useState(null);

  const classes = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Set a high limit to fetch all students at once
      const response = await axios.get(getApiUrl('/api/students?limit=1000'), {
        withCredentials: true
      });
      setStudents(response.data.students || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass === 'all' || student.grade === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Group students by class and section
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const className = student.grade;
    const section = student.section || 'A'; // Default to section A if no section specified
    const groupKey = `${className}-${section}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        className,
        section,
        students: []
      };
    }
    groups[groupKey].students.push(student);
    return groups;
  }, {});

  // Sort groups by class then section
  const sortedGroups = Object.values(groupedStudents).sort((a, b) => {
    const classOrder = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];
    const aClassIndex = classOrder.indexOf(a.className);
    const bClassIndex = classOrder.indexOf(b.className);
    
    if (aClassIndex !== bClassIndex) {
      return aClassIndex - bClassIndex;
    }
    
    // If same class, sort by section
    return a.section.localeCompare(b.section);
  });

  const getClassCount = (grade) => {
    return students.filter(student => student.grade === grade).length;
  };

  const isAdmin = document.cookie.includes('adminToken');

  return (
    <div className="min-h-screen bg-[#f3f2ef] min-w-0">
      <div className="max-w-[1128px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0 w-full">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow mb-4 p-4 sm:p-6 min-w-0 w-full max-w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0 w-full min-w-0">
            <div className="min-w-0 w-full">
              <h1 className="text-lg sm:text-2xl font-semibold text-[#191919] break-words w-full leading-tight">Student Management</h1>
              <p className="text-[#666666] mt-1 text-xs sm:text-base break-words w-full leading-tight">Manage and track student information efficiently</p>
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="w-full max-w-full min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
            {/* Visual scroll hint for mobile */}
            <div className="absolute right-0 top-0 h-full w-8 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent z-10 hidden sm:block"></div>
            <div className="flex flex-col md:flex-row gap-4 items-center min-w-[340px] w-full min-w-0">
              <div className="relative flex-1 w-full min-w-[200px] min-w-0">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-[#eef3f8] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
              <div className="flex gap-2 flex-nowrap overflow-x-auto pb-2 md:pb-0 w-full md:w-auto min-w-[340px] max-w-full min-w-0">
                <button
                  onClick={() => setSelectedClass('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedClass === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  All Classes ({students.length})
                </button>
                {classes.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedClass(grade)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedClass === grade
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {grade === 'Nursery' || grade === 'L.K.G.' || grade === 'U.K.G.' 
                      ? `${grade} (${getClassCount(grade)})`
                      : `Class ${grade} (${getClassCount(grade)})`
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Students Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{renderError(error)}</div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-8">
            {sortedGroups.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faUserGraduate} className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              sortedGroups.map((group, groupIndex) => (
                <div key={`${group.className}-${group.section}`} className="space-y-4">
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full min-w-0 gap-2 sm:gap-x-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-4 min-w-0 w-full">
                        <span className="text-lg sm:text-xl font-bold break-words w-full text-white">
                          {group.className === 'Nursery' || group.className === 'L.K.G.' || group.className === 'U.K.G.' 
                            ? `${group.className}` 
                            : `Class ${group.className}`
                          }
                        </span>
                        <span className="px-3 py-1 sm:px-4 sm:py-2 bg-white bg-opacity-90 rounded-full text-base sm:text-lg font-bold text-blue-900 shadow-md border border-blue-200 text-center">
                          Section {group.section}
                        </span>
                      </div>
                      <span className="bg-white bg-opacity-90 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-blue-900 shadow-md border border-blue-200 text-center min-w-[110px] sm:ml-4">
                        {group.students.length} {group.students.length === 1 ? 'Student' : 'Students'}
                      </span>
                    </div>
                  </div>

                  {/* Students Grid for this section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                      >
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                        <div className="p-6 -mt-12 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div className="h-16 w-16 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center shadow-md">
                              <span className="text-xl font-bold text-blue-600">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                {student.grade === 'Nursery' || student.grade === 'L.K.G.' || student.grade === 'U.K.G.' 
                                  ? student.grade
                                  : `Class ${student.grade}`
                                }
                              </span>
                              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                                Section {student.section || 'A'}
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{student.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-1">{student.email}</p>
                          
                          <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="line-clamp-1">Father: {student.fatherName}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="line-clamp-1">Mother: {student.motherName}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-auto">
                            {isAdmin && (
                              <Link
                                to="/edit-student"
                                state={{ student }}
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                              >
                                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Link>
                            )}
                            {isAdmin && (
                              <Link
                                to="/view-fee"
                                state={{ student }}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                              >
                                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Fee
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>        ) : (
          <div className="space-y-8">
            {sortedGroups.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faUserGraduate} className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              sortedGroups.map((group, groupIndex) => (
                <div key={`list-${group.className}-${group.section}`} className="space-y-4">
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-x-6 gap-y-2 w-full">
                      {/* Class & Section */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-4 gap-y-2">
                        <span className="text-lg sm:text-xl font-bold truncate text-white">
                          {group.className === 'Nursery' || group.className === 'L.K.G.' || group.className === 'U.K.G.' 
                            ? `${group.className}` 
                            : `Class ${group.className}`
                          }
                        </span>
                        <span className="px-3 py-1 sm:px-4 sm:py-2 bg-white bg-opacity-90 rounded-full text-base sm:text-lg font-bold text-blue-900 shadow-md border border-blue-200 text-center">
                          Section {group.section}
                        </span>
                      </div>
                      {/* Student Count */}
                      <span className="bg-white bg-opacity-90 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-blue-900 shadow-md border border-blue-200 text-center min-w-[110px]">
                        {group.students.length} {group.students.length === 1 ? 'Student' : 'Students'}
                      </span>
                    </div>
                  </div>

                  {/* Students Table for this section */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Mobile scroll hint */}
                    <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 md:hidden">
                      <p className="text-xs text-blue-700 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Swipe left to see more details
                      </p>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 table-responsive">
                      <div className="min-w-full inline-block align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">Student</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Class & Section</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell whitespace-nowrap min-w-[200px]">Contact</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap min-w-[200px]">Parents</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.students.map((student) => (
                              <tr 
                                key={student.id} 
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-lg font-semibold text-blue-600">
                                        {student.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="ml-4 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]" title={student.name}>{student.name}</div>
                                      <div className="text-sm text-gray-500 md:hidden truncate max-w-[140px]" title={student.email}>{student.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col space-y-1">
                                    <span className="px-3 py-1.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-600 whitespace-nowrap">
                                      {student.grade === 'Nursery' || student.grade === 'L.K.G.' || student.grade === 'U.K.G.' 
                                        ? student.grade
                                        : `Class ${student.grade}`
                                      }
                                    </span>
                                    <span className="px-3 py-1.5 inline-flex text-xs leading-4 font-bold rounded-full bg-green-100 text-green-600 whitespace-nowrap">
                                      Section {student.section || 'A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                  <div className="text-sm text-gray-900 truncate max-w-[180px]" title={student.email}>{student.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                  <div className="space-y-1 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span className="truncate max-w-[100px]" title={student.fatherName}>{student.fatherName}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span className="truncate max-w-[100px]" title={student.motherName}>{student.motherName}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex items-center justify-end gap-1">
                                    {isAdmin && (
                                      <Link
                                        to="/edit-student"
                                        state={{ student }}
                                        className="text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs transition-colors duration-200 inline-flex items-center flex-shrink-0"
                                      >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="hidden sm:inline">Edit</span>
                                      </Link>
                                    )}
                                    {isAdmin && (
                                      <Link
                                        to="/view-fee"
                                        state={{ student }}
                                        className="text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs transition-colors duration-200 inline-flex items-center flex-shrink-0"
                                      >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="hidden sm:inline">Fee</span>
                                      </Link>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;