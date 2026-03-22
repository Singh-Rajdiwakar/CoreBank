import React, { useState, useEffect } from 'react'
import { Activity, Filter, Download, Calendar, Search } from 'lucide-react'
import { toast } from 'sonner'
import { auditAPI } from '../../services/endpoints/audit'
import { formatDate } from '../../utils/formatting'

const actionColors = {
  'CREATE': 'bg-green-500/20 text-green-300',
  'UPDATE': 'bg-blue-500/20 text-blue-300',
  'DELETE': 'bg-red-500/20 text-red-300',
  'APPROVE': 'bg-emerald-500/20 text-emerald-300',
  'REJECT': 'bg-orange-500/20 text-orange-300',
  'VIEW': 'bg-gray-500/20 text-gray-300',
  'LOGIN': 'bg-purple-500/20 text-purple-300',
  'LOGOUT': 'bg-indigo-500/20 text-indigo-300',
  'TRANSFER': 'bg-cyan-500/20 text-cyan-300',
  'BLOCK': 'bg-red-500/20 text-red-300'
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const filters = {
        from: dateFrom || undefined,
        to: dateTo || undefined
      }
      const response = await auditAPI.getLogs(filters)
      let allLogs = response.data || []
      
      if (filterAction !== 'ALL') {
        allLogs = allLogs.filter(log => log.action === filterAction)
      }
      
      setLogs(allLogs)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = () => {
    fetchLogs()
  }

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Status', 'IP Address'],
      ...logs.map(log => [
        formatDate(log.timestamp),
        log.username,
        log.action,
        log.entityType,
        log.entityId,
        log.status,
        log.ipAddress
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
    toast.success('Audit logs exported successfully')
  }

  const filteredLogs = logs.filter(log =>
    log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entityId?.toString().includes(searchQuery) ||
    log.ipAddress?.includes(searchQuery)
  )

  const actionStats = {
    total: logs.length,
    creates: logs.filter(l => l.action === 'CREATE').length,
    updates: logs.filter(l => l.action === 'UPDATE').length,
    deletes: logs.filter(l => l.action === 'DELETE').length,
    approvals: logs.filter(l => l.action === 'APPROVE').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
          <p className="text-gray-400 mt-1">Review system activity and compliance logs</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs">Total Logs</p>
          <p className="text-white font-bold text-xl mt-1">{actionStats.total}</p>
        </div>
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-green-300 text-xs">Creates</p>
          <p className="text-green-400 font-bold text-xl mt-1">{actionStats.creates}</p>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-blue-300 text-xs">Updates</p>
          <p className="text-blue-400 font-bold text-xl mt-1">{actionStats.updates}</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          <p className="text-red-300 text-xs">Deletes</p>
          <p className="text-red-400 font-bold text-xl mt-1">{actionStats.deletes}</p>
        </div>
        <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
          <p className="text-emerald-300 text-xs">Approvals</p>
          <p className="text-emerald-400 font-bold text-xl mt-1">{actionStats.approvals}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-1">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search user, entity ID, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 items-end">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="TRANSFER">Transfer</option>
          </select>
          <button
            onClick={handleFilterChange}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No audit logs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700 bg-gray-800/50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                <th className="text-left py-3 px-4 font-semibold">User</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
                <th className="text-left py-3 px-4 font-semibold">Entity Type</th>
                <th className="text-left py-3 px-4 font-semibold">Entity ID</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">IP Address</th>
                <th className="text-right py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 text-xs">{formatDate(log.timestamp)}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{log.username}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${actionColors[log.action] || 'bg-gray-500/20 text-gray-300'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">{log.entityType}</td>
                  <td className="py-3 px-4 font-mono text-sm">{log.entityId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.status === 'SUCCESS' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-400">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedLog(log)
                        setShowDetails(true)
                      }}
                      className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/50 rounded text-xs font-semibold transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Audit Log Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Log Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Timestamp</p>
                  <p className="text-white font-semibold">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">User</p>
                  <p className="text-white font-mono">{selectedLog.username}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Action</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${actionColors[selectedLog.action] || 'bg-gray-500/20 text-gray-300'}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                    selectedLog.status === 'SUCCESS' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Entity Type</p>
                  <p className="text-white">{selectedLog.entityType}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Entity ID</p>
                  <p className="text-white font-mono">{selectedLog.entityId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-sm">IP Address</p>
                  <p className="text-white font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-sm">User Agent</p>
                  <p className="text-gray-300 text-xs break-all">{selectedLog.userAgent || 'N/A'}</p>
                </div>
              </div>

              {/* Details JSON */}
              {selectedLog.details && (
                <div className="border-t border-gray-700 pt-6">
                  <p className="text-gray-400 text-sm mb-2">Details</p>
                  <pre className="bg-gray-800 p-4 rounded border border-gray-700 text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2)}
                  </pre>
                </div>
              )}

              {/* Close Button */}
              <div className="border-t border-gray-700 pt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
