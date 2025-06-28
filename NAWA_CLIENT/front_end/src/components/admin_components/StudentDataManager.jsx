import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileExcel,
  faUpload,
  faDownload,
  faSpinner,
  faCheck,
  faExclamationTriangle,
  faTimes,
  faFileImport,
  faFileExport,
  faInfoCircle,
  faUsers,
  faTable,
  faCloudUpload
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const StudentDataManager = () => {
  // Check if user has access to this component
  const userEmail = localStorage.getItem('email');
  const hasAccess = userEmail === 'developer@nawataraenglishschool.com' || userEmail === 'admin@nawataraenglishschool.com';
  
  // If no access, show unauthorized message
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-4">
            Import/Export Data is restricted to Developer and Super Admin accounts only.
          </p>
          <p className="text-sm text-gray-500">
            Current user: {userEmail || 'Unknown'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [exportGrade, setExportGrade] = useState('all');
  const [exportSection, setExportSection] = useState('all');
  const [availableSections, setAvailableSections] = useState([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const grades = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  // Fetch available sections when export grade changes
  const fetchAvailableSections = async (grade) => {
    if (!grade || grade === 'all') {
      setAvailableSections([]);
      return;
    }

    try {
      const response = await axios.get(
        getApiUrl('/api/admin/student-data/sections'),
        {
          params: { grade },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setAvailableSections(response.data.sections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setAvailableSections([]);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setImportResult(null);
      toast.success('File selected successfully');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    if (!selectedGrade) {
      toast.error('Please select a grade for the students');
      return;
    }

    setImporting(true);
    setImportResult(null);    try {
      console.log('Attempting to import students...');
      console.log('Selected file:', selectedFile);
      console.log('Selected grade:', selectedGrade);
        const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('grade', selectedGrade);
      if (selectedSection) {
        formData.append('section', selectedSection);
      }const response = await axios.post(
        getApiUrl('/api/admin/student-data/import'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      console.log('Import response:', response);

      setImportResult(response.data);
      
      if (response.data.success) {
        toast.success(response.data.message);        setSelectedFile(null);
        setSelectedGrade('');
        setSelectedSection('');
        // Reset file input
        document.getElementById('fileInput').value = '';
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to import students';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setImportResult(error.response.data);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {      const response = await axios.get(
        getApiUrl('/api/admin/student-data/export'),
        {
          params: { 
            grade: exportGrade,
            section: exportSection !== 'all' ? exportSection : undefined
          },
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'Students_Export.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Students data exported successfully');

    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to export students';
      toast.error(errorMessage);
    } finally {
      setExporting(false);
    }
  };  const downloadTemplate = async () => {
    setDownloadingTemplate(true);

    try {
      console.log('Attempting to download template...');
      
      const response = await axios.get(
        getApiUrl('/api/admin/student-data/template'),
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      console.log('Template download response:', response);

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Student_Import_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');    } catch (error) {
      console.error('Template download error:', error);
      console.log('Error response:', error.response);
      toast.error('Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faTable} className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Data Manager</h1>
                <p className="text-gray-600 mt-1">Import and export student data with ease</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Import Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileImport} className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Import Students</h2>
                  <p className="text-blue-100">Upload student data from Excel file</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Template Download */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Import Format</h3>                    <p className="text-blue-700 text-sm mb-3">
                      Download the template to see the required format. Columns: Student Name, Address, Father's Name, Mother's Name, Father's Phone, Mother's Phone, Section (optional)
                    </p>
                    <button
                      onClick={downloadTemplate}
                      disabled={downloadingTemplate}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 text-sm"
                    >
                      {downloadingTemplate ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faDownload} className="mr-2" />
                          Download Template
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>              {/* Grade Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Grade for Import
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Choose a grade...</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Section Selection (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Section (Optional)
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">No specific section (use Excel data or default A)</option>
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  If not selected, section from Excel file will be used, or defaults to 'A'
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <div className="relative">
                  <input
                    id="fileInput"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all duration-300">
                    <FontAwesomeIcon icon={faCloudUpload} className="text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to select Excel file or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Excel files only (.xlsx, .xls) - Max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={importing || !selectedFile || !selectedGrade}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {importing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Importing Students...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    Import Students
                  </>
                )}
              </button>

              {/* Import Result */}
              {importResult && (
                <div className={`mt-6 p-4 rounded-xl ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <FontAwesomeIcon 
                      icon={importResult.success ? faCheck : faExclamationTriangle} 
                      className={`mt-1 ${importResult.success ? 'text-green-600' : 'text-red-600'}`} 
                    />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        importResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {importResult.success ? 'Import Successful' : 'Import Failed'}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        importResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {importResult.message}
                      </p>
                      
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-red-800 mb-2">Errors found:</p>
                          <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                            {importResult.errors.map((error, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-red-500">•</span>
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileExport} className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Export Students</h2>
                  <p className="text-green-100">Download student data as Excel file</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Export Info */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faUsers} className="text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Export Format</h3>                    <p className="text-green-700 text-sm">
                      Export includes: Student Name, Address, Father's Name, Mother's Name, Father's Phone, Mother's Phone, Grade, and Section
                    </p>
                  </div>
                </div>
              </div>              {/* Grade Selection for Export */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Grade to Export
                </label>
                <select
                  value={exportGrade}
                  onChange={(e) => {
                    setExportGrade(e.target.value);
                    setExportSection('all');
                    fetchAvailableSections(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Section Selection for Export */}
              {exportGrade !== 'all' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Section to Export
                  </label>
                  <select
                    value={exportSection}
                    onChange={(e) => setExportSection(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="all">All Sections</option>
                    {availableSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  {availableSections.length === 0 && exportGrade !== 'all' && (
                    <p className="text-sm text-gray-500 mt-1">
                      No sections found for this grade
                    </p>
                  )}
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {exporting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Exporting Students...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export Students Data
                  </>
                )}
              </button>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                  <FontAwesomeIcon icon={faFileImport} className="text-2xl mb-2" />
                  <h3 className="font-semibold">Import</h3>
                  <p className="text-sm text-blue-100">Bulk add students</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white text-center">
                  <FontAwesomeIcon icon={faFileExport} className="text-2xl mb-2" />
                  <h3 className="font-semibold">Export</h3>
                  <p className="text-sm text-green-100">Download data</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faInfoCircle} className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Instructions</h2>
                <p className="text-purple-100">How to use the import/export features</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faFileImport} className="text-blue-600 mr-2" />
                  Import Instructions
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">1.</span>
                    <span>Download the template file to see the required format</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">2.</span>
                    <span>Fill in your student data following the exact column format</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">3.</span>
                    <span>Ensure phone numbers are exactly 10 digits</span>
                  </li>                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">4.</span>
                    <span>Select the target grade and optionally a section for all students</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">5.</span>
                    <span>Upload the file and review any validation errors</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faFileExport} className="text-green-600 mr-2" />
                  Export Instructions
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 font-bold">1.</span>
                    <span>Choose to export all grades or a specific grade and section</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 font-bold">2.</span>
                    <span>Click export to download the Excel file</span>
                  </li>                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 font-bold">3.</span>
                    <span>File will include all student information with grade and section details</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 font-bold">4.</span>
                    <span>Use exported files for backup or migration purposes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 font-bold">5.</span>
                    <span>Exported files can be modified and re-imported</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDataManager;
