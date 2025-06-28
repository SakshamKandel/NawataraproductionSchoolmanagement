import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import FetchStudentData from "./FetchStudentData";
import NoAccess from "../../NoAccess";
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiUsers, FiChevronDown, FiLoader } from 'react-icons/fi';
import { getApiUrl } from '../../../config/api.js';

const FetchStudents = () => {
  const adminLoggedIn = document.cookie.includes("adminToken");
  const teacherLoggedIn = document.cookie.includes("teacherToken");
  const [hasSearchedOrFiltered, setHasSearchedOrFiltered] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const navigate = useNavigate();
  const [showModal, setshowModal] = useState(false);
  const [singleData, setsingleData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFrom, setClassFrom] = useState("");
  const [classTo, setClassTo] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Define all classes in order including nursery classes
  const allClasses = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];

  const fetchStudents_ClassRange = async () => {
    if (!classFrom || !classTo) {
      toast.error("Please select both 'Class From' and 'Class To'.");
      return;
    }
    
    const fromIndex = allClasses.indexOf(classFrom);
    const toIndex = allClasses.indexOf(classTo);
    
    if (fromIndex > toIndex) {
      toast.error("'Class From' cannot be after 'Class To' in the class sequence.");
      return;
    }
    
    setHasSearchedOrFiltered(false);
    setLoading(true);
    setStudentsData([]);
    let allStudents = [];
    
    try {
      // Get the range of classes to fetch
      const classesToFetch = allClasses.slice(fromIndex, toIndex + 1);
      
      for (const className of classesToFetch) {
        try {
          const response = await axios.get(
            getApiUrl(`/getStudents/${className}`),
            { withCredentials: true }
          );
          
          if (response.data && Array.isArray(response.data)) {
            const formattedStudents = response.data.map(student => ({
              ...student,
              id: student.id || student._id,
              class_name: student.grade || student.class_name
            }));
            allStudents = allStudents.concat(formattedStudents);
          }
        } catch (error) {
          console.error(`Error fetching students from class ${className}:`, error);
        }
      }
      
      setStudentsData(allStudents);
      setHasSearchedOrFiltered(true); 
      
      if (allStudents.length === 0) {
        toast.info("No students found in the selected class range.");
      } else {
        toast.success(`Found ${allStudents.length} students.`);
      }
    } catch (error) {
      toast.error("An error occurred while fetching students.");
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewHandleFunc = (student) => {
    setsingleData(student);
    setshowModal(true);
  };

  const handleEditStudent = (studentId) => {
    const student = studentsData.find(s => s.id === studentId);
    if (student) {
      navigate('/edit-details', { state: { student } });
    } else {
      toast.error("Student details not found.");
    }
  };

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDeleteStudentAction = async () => {
    if (!studentToDelete) return;
    console.log("Deleting student:", studentToDelete.name);
    toast.info(`Deletion for ${studentToDelete.name} (ID: ${studentToDelete.id}) needs backend implementation.`);
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.id?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  // Group students by class and section
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const className = student.class_name || student.grade;
    const section = student.section || 'No Section';
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

  if (!adminLoggedIn && !teacherLoggedIn) {
    return <NoAccess />;
  }

  return (    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-full mx-auto ${(showModal || showDeleteModal) ? 'filter blur-sm brightness-75' : ''}`}>
          
          <div className="mb-8 p-4 bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <FiUsers className="text-3xl text-blue-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Student Directory</h1>
                  <p className="text-sm text-gray-500">Manage student profiles, details, and records.</p>
                </div>
              </div>
              {adminLoggedIn && (
                <Link
                  to="/create-account-student"
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                >
                  <FiPlus className="mr-2 h-5 w-5" />
                  Add New Student
                </Link>
              )}
            </div>
          </div>

          <div className="mb-6 p-6 bg-white shadow-xl rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="relative">
                <label htmlFor="class_from" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Class From
                </label>
                <select
                  id="class_from"
                  value={classFrom}
                  onChange={e => setClassFrom(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 appearance-none transition-colors"
                >
                  <option value="">Select class</option>
                  {allClasses.map(className => (
                    <option key={className} value={className}>
                      {className === 'Nursery' || className === 'L.K.G.' || className === 'U.K.G.' 
                        ? className 
                        : `Class ${className}`
                      }
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-10 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <label htmlFor="class_to" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Class To
                </label>
                <select
                  id="class_to"
                  value={classTo}
                  onChange={e => setClassTo(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 appearance-none transition-colors"
                >
                  <option value="">Select class</option>
                  {allClasses.map(className => (
                    <option key={className} value={className}>
                      {className === 'Nursery' || className === 'L.K.G.' || className === 'U.K.G.' 
                        ? className 
                        : `Class ${className}`
                      }
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-10 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <label htmlFor="section_filter" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Section Filter
                </label>
                <select
                  id="section_filter"
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 appearance-none transition-colors"
                >
                  <option value="">All Sections</option>
                  {[...new Set(studentsData.map(s => s.section).filter(Boolean))].sort().map(section => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-10 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                type="button"
                onClick={fetchStudents_ClassRange}
                disabled={loading || !classFrom || !classTo}
                className="w-full flex items-center justify-center py-2.5 px-5 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2 h-5 w-5" />
                    Find Students
                  </>
                )}
              </button>
            </div>
          </div>
            {hasSearchedOrFiltered && !loading && (
            <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {filteredStudents.length > 0 ? `Showing ${filteredStudents.length} Student(s)` : 'Student List'}
                </h2>
                <div className="relative w-full sm:w-1/3">
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>              {filteredStudents.length > 0 ? (
                <>
                  {/* Display students grouped by class and section */}
                  {sortedGroups.map((group, groupIndex) => (
                    <div key={`${group.className}-${group.section}`}>
                      {/* Add divider between groups except for the first one */}
                      {groupIndex > 0 && (
                        <div className="flex items-center justify-center py-6">
                          <div className="border-t border-gray-300 flex-grow"></div>
                          <span className="px-4 text-gray-500 text-sm font-medium">●</span>
                          <div className="border-t border-gray-300 flex-grow"></div>
                        </div>
                      )}
                      
                      <div className="mb-8 shadow-xl rounded-lg overflow-hidden border border-gray-200">
                        {/* Group Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">
                              {group.className === 'Nursery' || group.className === 'L.K.G.' || group.className === 'U.K.G.' 
                                ? `${group.className}` 
                                : `Class ${group.className}`
                              }
                              {group.section !== 'No Section' && (
                                <span className="ml-3 px-4 py-2 bg-white bg-opacity-25 rounded-full text-lg font-semibold">
                                  Section {group.section}
                                </span>
                              )}
                            </h3>
                            <span className="bg-white bg-opacity-25 px-4 py-2 rounded-full text-sm font-bold">
                              {group.students.length} {group.students.length === 1 ? 'Student' : 'Students'}
                            </span>
                          </div>
                        </div>

                        {/* Students Table for this group */}
                        <div className="bg-white rounded-b-lg border border-t-0 border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.N.</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {group.students.map((student, studentIndex) => (
                                  <tr key={student.id} className="hover:bg-gray-50 hover:shadow-sm transition-all duration-150 ease-in-out">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{studentIndex + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                        {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                      <div className="flex items-center justify-center space-x-2">
                                        <button
                                          onClick={() => viewHandleFunc(student)}
                                          title="View Profile"
                                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-all duration-200 transform hover:scale-110 flex-shrink-0"
                                        >
                                          <FiEye className="h-4 w-4" />
                                        </button>
                                        {adminLoggedIn && (
                                          <>
                                            <button
                                              onClick={() => handleEditStudent(student.id)}
                                              title="Edit Student"
                                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-full transition-all duration-200 transform hover:scale-110 flex-shrink-0"
                                            >
                                              <FiEdit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteStudent(student)}
                                              title="Delete Student"
                                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-all duration-200 transform hover:scale-110 flex-shrink-0"
                                            >
                                              <FiTrash2 className="h-4 w-4" />
                                            </button>
                                          </>
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
                  ))}
                </>
              ) : (
                <div className="text-center py-12 px-6">
                  <FiUsers className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-800">No Students Found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm ? "Your search didn't match any students." : "There are no students matching the current criteria."} <br/>
                    Try adjusting your search or filter.
                  </p>
                </div>
              )}
            </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white shadow-xl rounded-xl border border-gray-200 mt-6">
              <FiLoader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">Fetching Students...</h3>
              <p className="text-sm text-gray-500">Please wait while we load the student data.</p>
            </div>
          )}

          {!hasSearchedOrFiltered && !loading && (
            <div className="text-center py-20 px-6 bg-white shadow-xl rounded-xl border border-gray-200 mt-6">
              <FiUsers className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Ready to Find Students</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please select a class range using the filters above and click "Find Students" to display the list.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Student Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0"></div>
        {singleData && (
          <div className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out transform ${showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <FetchStudentData student={singleData} onClose={() => setshowModal(false)} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${showDeleteModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0"></div>
        {studentToDelete && (
          <div className={`bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transition-all duration-300 ease-out transform ${showDeleteModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FiTrash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900" id="modal-title">
                Delete Student
              </h3>
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the student "{studentToDelete.name}" (ID: {studentToDelete.id})? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={confirmDeleteStudentAction}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FetchStudents;