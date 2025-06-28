import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import { renderError } from '../../utils/errorUtils.js';

const AttachmentTest = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(getApiUrl('/api/notices'));
        console.log("Raw API response:", response);
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
  
  if (loading) return <div className="p-4">Loading notices...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {renderError(error)}</div>;
  
  return (
    <div className="p-4 bg-white">
      <h1 className="text-xl font-bold mb-4">Attachment Diagnostic</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Response Overview</h2>
        <p><strong>Total notices:</strong> {notices.length}</p>
        <p><strong>Notices with attachments:</strong> {notices.filter(n => n.attachments).length}</p>
      </div>
      
      <div className="space-y-6">
        {notices.map((notice) => (
          <div key={notice._id} className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-bold">{notice.noticetitle}</h2>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Raw Notice Object:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(notice, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Attachment Tests:</h3>
                <div className="space-y-2">
                  <div className="bg-gray-100 p-2 rounded">
                    <div><strong>notice.attachments exists:</strong> {notice.attachments ? 'Yes ✅' : 'No ❌'}</div>
                    <div><strong>typeof attachments:</strong> {typeof notice.attachments}</div>
                    <div><strong>attachment value:</strong> {String(notice.attachments)}</div>
                  </div>
                  
                  {notice.attachments && (
                    <>
                      <div className="mt-3">
                        <strong>Generated URL:</strong>
                        <div className="mt-1">
                          <a 
                            href={getApiUrl(`/${notice.attachments}`)}
                            target="_blank" 
                            rel="noreferrer"
                            className="block bg-blue-100 p-2 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                          >
                            {getApiUrl(`/${notice.attachments}`)}
                          </a>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <strong>Try alternative URLs:</strong>
                        <div className="mt-1 space-y-2">
                          <a 
                            href={getApiUrl(`/notice_files/${notice.attachments}`)}
                            target="_blank" 
                            rel="noreferrer"
                            className="block bg-green-100 p-2 text-green-800 rounded hover:bg-green-200 transition-colors"
                          >
                            {getApiUrl(`/notice_files/${notice.attachments}`)}
                          </a>
                          <a 
                            href={getApiUrl(`/public/notice_files/${notice.attachments}`)}
                            target="_blank" 
                            rel="noreferrer"
                            className="block bg-purple-100 p-2 text-purple-800 rounded hover:bg-purple-200 transition-colors"
                          >
                            {getApiUrl(`/public/notice_files/${notice.attachments}`)}
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentTest; 