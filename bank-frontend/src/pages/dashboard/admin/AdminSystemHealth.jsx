import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../../services/api';

const CheckCircleIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>;
const XCircleIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5 13.5 13.5m0-3-3 3m8.25-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>;
const ExclamationTriangleIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const AdminSystemHealth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States for the different panels
  const [monitoring, setMonitoring] = useState(null);
  const [notifSummary, setNotifSummary] = useState(null);
  const [queueData, setQueueData] = useState({ content: [], totalPages: 0, number: 0 });
  const [page, setPage] = useState(0);

  // States for Export Dead Letter
  const [exportChannel, setExportChannel] = useState('EMAIL');
  const [exportLimit, setExportLimit] = useState(100);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [monRes, summaryRes, queueRes] = await Promise.all([
        adminAPI.getMonitoring(),
        adminAPI.getNotificationSummary(),
        adminAPI.getNotificationQueue(page, 10)
      ]);
      setMonitoring(monRes.data);
      setNotifSummary(summaryRes.data);
      setQueueData(queueRes.data);
    } catch (err) {
      setError('Failed to load system health data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryDispatch = async (channel) => {
    setLoading(true);
    try {
      await adminAPI.retryNotificationDispatch(channel);
      showSuccess(`Retry dispatched for ${channel} channel successfully`);
      fetchData();
    } catch (err) {
      setError(`Failed to retry ${channel} dispatch`);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to clean up old notification logs? This action cannot be undone.')) {
      setLoading(true);
      try {
        const res = await adminAPI.cleanupNotifications();
        showSuccess(res.data.message || 'Notification logs cleaned up successfully');
        fetchData();
      } catch (err) {
        setError('Failed to cleanup logs');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportDeadLetter = async () => {
    setExporting(true);
    setError('');
    try {
      const response = await adminAPI.exportDeadLetter(exportChannel, exportLimit);
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dead-letter-${exportChannel}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSuccess(`Exported ${exportChannel} dead-letter logs successfully.`);
    } catch (err) {
      setError('Failed to export dead-letter CSV');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health & Communications</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor API metrics and notification dispatch queues.</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center shadow-sm">
          <XCircleIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center shadow-sm">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Monitoring Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Server Health Monitoring</h3>
          {loading && !monitoring ? (
             <div className="text-sm text-gray-500">Loading metrics...</div>
          ) : monitoring ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                <span className="text-sm text-gray-500">System Uptime</span>
                <span className="font-semibold text-gray-800">{monitoring.uptime || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                <span className="text-sm text-gray-500">Memory Usage</span>
                <span className="font-semibold text-gray-800">{monitoring.memoryUsage || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                <span className="text-sm text-gray-500">Active Sessions</span>
                <span className="font-semibold text-gray-800">{monitoring.activeSessions || '0'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                <span className="text-sm text-gray-500">API Latency Avg</span>
                <span className="font-semibold text-gray-800">{monitoring.apiLatency || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No monitoring data available</div>
          )}
        </motion.div>

        {/* Notifications Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h3 className="text-lg font-medium text-gray-900">Communication Services</h3>
             <button
                onClick={handleCleanup}
                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-md font-medium flex items-center transition-colors"
                title="Cleanup old logs"
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Cleanup Old Logs
             </button>
          </div>
          
          {loading && !notifSummary ? (
            <div className="text-sm text-gray-500">Loading summary...</div>
          ) : notifSummary ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-xs font-medium text-yellow-600 uppercase tracking-wider mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{notifSummary.pendingCount || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Sent</p>
                <p className="text-2xl font-bold text-green-700">{notifSummary.sentCount || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-700">{notifSummary.failedCount || 0}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-6">No summary available</div>
          )}

          <div className="space-y-3">
             <h4 className="text-sm font-medium text-gray-700 mb-2">Retry Dispatches</h4>
             <div className="grid grid-cols-3 gap-2">
                {['EMAIL', 'SMS', 'IN_APP'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => handleRetryDispatch(channel)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    {channel}
                  </button>
                ))}
             </div>
          </div>
        </motion.div>
      </div>

      {/* Data Export & Audit Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Data Export & Audit Log Extraction</h3>
        <p className="text-sm text-gray-500 mb-4">Export failed notification logs (dead-letters) for external auditing or offline analysis.</p>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Target Channel</label>
            <select
              value={exportChannel}
              onChange={(e) => setExportChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm sm:text-sm"
            >
              <option value="EMAIL">EMAIL</option>
              <option value="SMS">SMS</option>
              <option value="IN_APP">IN_APP</option>
            </select>
          </div>
          
          <div className="w-full sm:w-1/4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Record Limit</label>
            <input
              type="number"
              min="1"
              max="5000"
              value={exportLimit}
              onChange={(e) => setExportLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm sm:text-sm"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <button
              onClick={handleExportDeadLetter}
              disabled={exporting}
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {exporting ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* active notification queue table */}
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Active Notification Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-white">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {queueData.content && queueData.content.length > 0 ? (
                 queueData.content.map((item, idx) => (
                   <tr key={item.id || idx} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.channel}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.recipient}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${item.status === 'SENT' ? 'bg-green-100 text-green-800' : 
                            item.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                         {item.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                     No notifications in queue
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {queueData.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 flex items-center">
                Page {page + 1} of {queueData.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(queueData.totalPages - 1, p + 1))}
                disabled={page === queueData.totalPages - 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSystemHealth;
