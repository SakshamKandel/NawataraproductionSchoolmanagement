import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import { renderError } from '../../utils/errorUtils.js';

const NoticeDiagnostic = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(getApiUrl('/api/notices'));
        console.log("All notices:", response.data);
        
        // Check for attachment issues
        response.data.forEach(notice => {
          console.log(`Notice: ${notice.noticetitle}`, { 
            hasAttachment: !!notice.attachments,
            attachmentValue: notice.attachments,
            fileInfo: notice.fileInfo,
            attachmentType: notice.attachments ? typeof notice.attachments : 'none'
          });
        });
        
        setNotices(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchNotices();
  }, []);
  
  // Function to test file URL accessibility
  const testFileAccess = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };
    } catch (err) {
      return {
        error: err.message,
        ok: false
      };
    }
  };
  
  // Test a file URL when button is clicked
  const handleTestFile = async (url, noticeId) => {
    const result = await testFileAccess(url);
    console.log(`File access test for notice ${noticeId}:`, result);
    
    // Update the notices array with the test result
    setNotices(prevNotices => 
      prevNotices.map(notice => 
        notice._id === noticeId 
          ? {...notice, testResult: result} 
          : notice
      )
    );
  };
  
  if (loading) return <div className="p-4">Loading diagnostic data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {renderError(error)}</div>;
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Notice Diagnostic Tool</h1>
      <p className="mb-4 text-sm text-gray-600">
        This tool helps debug issues with notice attachments.
      </p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Has Attachment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attachment Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notices.map((notice) => {
              const hasAttachment = !!notice.attachments;
              const fileUrl = hasAttachment 
                ? getApiUrl(`/${notice.attachments}`)
                : null;
                
              return (
                <tr key={notice._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notice._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{notice.noticetitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(notice.date || notice.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      hasAttachment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hasAttachment ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {hasAttachment ? (
                      <div className="max-w-xs">
                        <code className="text-xs bg-gray-100 p-1 rounded">
                          {typeof notice.attachments === 'string' 
                            ? notice.attachments 
                            : JSON.stringify(notice.attachments)}
                        </code>
                        {notice.fileInfo && (
                          <div className="mt-2 text-xs bg-blue-50 p-1 rounded">
                            <div><strong>File Info:</strong></div>
                            <pre className="whitespace-pre-wrap overflow-x-auto">
                              {notice.fileInfo}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hasAttachment && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleTestFile(fileUrl, notice._id)}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
                        >
                          Test File Access
                        </button>
                        
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 ml-2"
                        >
                          Try Open
                        </a>
                        
                        {notice.testResult && (
                          <div className={`text-xs p-1 mt-1 rounded ${
                            notice.testResult.ok ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {notice.testResult.ok 
                              ? `✓ File accessible (${notice.testResult.status})` 
                              : `✗ Error: ${notice.testResult.error || notice.testResult.statusText}`}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h2 className="font-semibold text-yellow-800">Troubleshooting Tips</h2>
        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
          <li>Check that the server is properly storing file paths in the database</li>
          <li>Verify that files are being saved to the correct directory (public/notice_files)</li>
          <li>Ensure the server is serving static files from the public directory</li>
          <li>Check for any CORS or permission issues that might be blocking file access</li>
        </ul>
      </div>
    </div>
  );
};

export default NoticeDiagnostic; 