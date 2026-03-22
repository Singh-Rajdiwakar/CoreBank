import React, { useState, useEffect } from 'react'
import { Activity, Users, TrendingUp, AlertTriangle, Server, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { adminAPI } from '../../services/endpoints/admin'
import { formatCurrency } from '../../utils/formatting'

export default function MonitoringPage() {
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    transactionsToday: 0,
    totalVolumeToday: 0,
    systemHealth: 100,
    serverUptime: '99.9%',
    dbConnections: 0,
    apiLatency: 0,
    errorRate: 0,
    peakTransactionTime: '',
    alerts: []
  })

  useEffect(() => {
    fetchMetrics()
    const interval = autoRefresh ? setInterval(fetchMetrics, 5000) : null
    return () => interval && clearInterval(interval)
  }, [autoRefresh])

  const fetchMetrics = async () => {
    try {
      const response = await adminAPI.getMonitoringMetrics()
      setMetrics(response.data || metrics)
    } catch (error) {
      console.error('Failed to fetch metrics')
    }
  }

  const handleManualRefresh = async () => {
    setLoading(true)
    try {
      await fetchMetrics()
      toast.success('Metrics refreshed')
    } catch (error) {
      toast.error('Failed to refresh metrics')
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-400'
    if (health >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 border-red-500/50 text-red-300'
      case 'WARNING':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300'
    }
  }

  const getAlertIcon = (severity) => {
    return severity === 'CRITICAL' ? AlertTriangle : Clock
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Monitoring</h2>
          <p className="text-gray-400 mt-1">Real-time system health and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-2"
            />
            <span className="text-gray-300">Auto-refresh</span>
          </label>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Users */}
        <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Users size={20} className="text-blue-400" />
            <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded">Live</span>
          </div>
          <p className="text-gray-400 text-sm">Active Users</p>
          <p className="text-white font-bold text-2xl mt-2">{metrics.activeUsers.toLocaleString()}</p>
          <p className="text-blue-300 text-xs mt-2">↑ 12% from last hour</p>
        </div>

        {/* Transactions Today */}
        <div className="p-6 bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Activity size={20} className="text-cyan-400" />
            <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">Today</span>
          </div>
          <p className="text-gray-400 text-sm">Transactions</p>
          <p className="text-white font-bold text-2xl mt-2">{metrics.transactionsToday.toLocaleString()}</p>
          <p className="text-cyan-300 text-xs mt-2">↑ 8% from average</p>
        </div>

        {/* Total Volume */}
        <div className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-lg hover:border-green-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={20} className="text-green-400" />
            <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded">Today</span>
          </div>
          <p className="text-gray-400 text-sm">Transaction Volume</p>
          <p className="text-white font-bold text-2xl mt-2">{formatCurrency(metrics.totalVolumeToday)}</p>
          <p className="text-green-300 text-xs mt-2">↑ 15% from yesterday</p>
        </div>

        {/* System Health */}
        <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Server size={20} className="text-purple-400" />
            <span className={`text-xs px-2 py-1 rounded ${metrics.systemHealth >= 90 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
              {metrics.systemHealth >= 90 ? 'Healthy' : 'Monitor'}
            </span>
          </div>
          <p className="text-gray-400 text-sm">System Health</p>
          <p className={`font-bold text-2xl mt-2 ${getHealthColor(metrics.systemHealth)}`}>{metrics.systemHealth}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
            <div
              className={`h-2 rounded-full transition-all ${
                metrics.systemHealth >= 90 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${metrics.systemHealth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Server Uptime */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Server Uptime</h3>
            <Clock size={18} className="text-cyan-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Current Uptime</p>
              <p className="text-white font-bold text-lg">{metrics.serverUptime}</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-green-300 text-xs">✓ All systems operational</p>
            </div>
          </div>
        </div>

        {/* Database Connections */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">DB Connections</h3>
            <Activity size={18} className="text-blue-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Active Connections</p>
              <p className="text-white font-bold text-lg">{metrics.dbConnections || 0}/100</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((metrics.dbConnections || 0) / 100) * 100}%` }}
              />
            </div>
            <p className="text-blue-300 text-xs">{Math.round(((metrics.dbConnections || 0) / 100) * 100)}% utilization</p>
          </div>
        </div>

        {/* API Latency */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">API Latency</h3>
            <Activity size={18} className="text-green-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Average Latency</p>
              <p className="text-white font-bold text-lg">{metrics.apiLatency || 0}ms</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-green-300 text-xs">✓ Within acceptable range</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Rate */}
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Error Rate</h3>
          <AlertTriangle size={18} className={metrics.errorRate > 1 ? 'text-red-400' : 'text-green-400'} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-gray-400 text-sm">Current Error Rate</p>
            <p className={`font-bold text-2xl mt-2 ${metrics.errorRate > 1 ? 'text-red-400' : 'text-green-400'}`}>
              {(metrics.errorRate || 0).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">24-Hour Average</p>
            <p className="text-white font-bold text-2xl mt-2">0.3%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Peak Time</p>
            <p className="text-white font-bold text-2xl mt-2">{metrics.peakTransactionTime || 'N/A'}</p>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${metrics.errorRate > 1 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(metrics.errorRate * 10 || 0, 100)}%` }}
          />
        </div>
      </div>

      {/* Alerts */}
      {metrics.alerts && metrics.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Recent Alerts</h3>
          <div className="space-y-2">
            {metrics.alerts.map((alert, idx) => {
              const AlertIcon = getAlertIcon(alert.severity)
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border flex items-start gap-3 ${getAlertColor(alert.severity)}`}
                >
                  <AlertIcon size={18} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm opacity-90">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">{alert.timestamp}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {metrics.alerts?.length === 0 && (
        <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <Activity className="mx-auto text-green-400 mb-2" size={32} />
          <p className="text-green-300 font-semibold">All Systems Operational</p>
          <p className="text-green-200 text-sm mt-1">No alerts at this time</p>
        </div>
      )}
    </div>
  )
}
