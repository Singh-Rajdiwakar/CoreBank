import React, { useState, useEffect } from 'react';
import { Shield, Search, Calendar, RefreshCw, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { auditorAPI } from '../../../services/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const AuditorAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 50,
    totalPages: 0,
    totalElements: 0
  });

  // Date filters initialized to last 7 days
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.size]); // We'll manually trigger fetch on date change, but auto fetch on page change

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // The API expects ISO date strings like '2023-11-20T00:00:00' typically, 
      // but let's pass what we have and append time if needed.
      const params = {
        from: `${dateRange.from}T00:00:00`,
        to: `${dateRange.to}T23:59:59`,
        page: pagination.page,
        size: pagination.size
      };

      const res = await auditorAPI.getAuditLogs(params);
      
      const payload = res.data?.data || res.data;
      
      // Handle both standard array response and paginated Spring Boot response format
      if (payload?.content) {
        setLogs(payload.content);
        setPagination(prev => ({
          ...prev,
          totalPages: payload.totalPages || 0,
          totalElements: payload.totalElements || 0
        }));
      } else if (Array.isArray(payload)) {
        setLogs(payload);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(payload.length / prev.size),
          totalElements: payload.length
        }));
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      // For development/mock purposes if the endpoint doesn't exist yet, we show an error.
      setError('Unable to securely retrieve audit logs. ' + (err.response?.data?.message || err.message));
      setLogs([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (pagination.page !== 0) {
      // Reset to page 0; useEffect will trigger fetch
      setPagination(prev => ({ ...prev, page: 0 }));
    } else {
      fetchLogs();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < (pagination.totalPages || 1)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* Header - Corporate/Secure look */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-md border border-gray-300">
                <Shield className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Compliance & Audit Portal</h1>
                <p className="text-gray-500 font-mono text-xs mt-1">READ-ONLY ACCESS • ROLE: AUDITOR</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
              <Activity className="w-3 h-3 text-green-500 animate-pulse" />
              <span>SYSTEM SECURE</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
          <form onSubmit={handleSearch} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50/50">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded focus:ring-0 focus:border-gray-500 font-mono text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded focus:ring-0 focus:border-gray-500 font-mono text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Results Per Page</label>
              <select
                value={pagination.size}
                onChange={(e) => {
                  setPagination(prev => ({ ...prev, size: Number(e.target.value), page: 0 }));
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-0 focus:border-gray-500 font-mono text-sm"
              >
                <option value={20}>20 LIMIT</option>
                <option value={50}>50 LIMIT</option>
                <option value={100}>100 LIMIT</option>
              </select>
            </div>
            <div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white font-bold tracking-wider uppercase text-sm py-2 px-4 rounded border border-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Querying...' : 'Query Logs'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-mono text-red-700 font-medium">QUERY_FAILURE: {error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Grid */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-300">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-300">Action Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-300">Target Entity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-300">Changes</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-300">User / IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 font-mono text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
                      <span className="uppercase tracking-widest text-xs">Accessing Secure Records...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <span className="uppercase tracking-widest text-xs text-gray-500">No records found for specified constraints.</span>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-3 whitespace-nowrap text-gray-600 border-r border-gray-100">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                           year: 'numeric', month: '2-digit', day: '2-digit', 
                           hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
                        })}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap border-r border-gray-100">
                        <span className="px-2 inline-flex text-xs leading-5 font-bold rounded bg-gray-100 text-gray-800 border border-gray-300">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-6 py-3 border-r border-gray-100">
                        <div className="text-gray-900 font-bold">{log.targetEntity}</div>
                        <div className="text-gray-500 text-xs">ID: {log.entityId}</div>
                      </td>
                      <td className="px-6 py-3 border-r border-gray-100 max-w-lg truncate group-hover:whitespace-normal group-hover:break-words">
                        {log.oldValue && log.newValue ? (
                          <div className="space-y-1">
                            <div className="text-red-700 bg-red-50 px-1 inline-block text-xs border border-red-100 mr-2 rounded-sm">- {log.oldValue}</div>
                            <div className="text-green-700 bg-green-50 px-1 inline-block text-xs border border-green-100 rounded-sm">+ {log.newValue}</div>
                          </div>
                        ) : (
                           <span className="text-gray-400 italic">No value changes</span>
                        )}
                        {log.details && (
                          <div className="text-gray-600 text-xs mt-1 truncate group-hover:whitespace-normal">{log.details}</div>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                        <div className="text-gray-900">{log.performedBy}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{log.ipAddress || 'UNKNOWN_IP'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-mono text-gray-700">
                  SHOWING PAGE <span className="font-bold text-gray-900">{pagination.page + 1}</span> OF <span className="font-bold text-gray-900">{Math.max(pagination.totalPages, 1)}</span>
                  {pagination.totalElements > 0 && (
                    <> (TOTAL RECORDS: <span className="font-bold text-gray-900">{pagination.totalElements}</span>)</>
                  )}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0 || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1 || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AuditorAuditLogs;
