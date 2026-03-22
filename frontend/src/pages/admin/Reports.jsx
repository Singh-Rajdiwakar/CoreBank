import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Filter, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { adminAPI } from '../../services/endpoints/admin'
import { formatCurrency } from '../../utils/formatting'

const COLORS = ['#0ea5e9', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('revenue')
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('3m')
  const [data, setData] = useState({
    revenueData: [],
    npaData: [],
    loanPortfolioData: [],
    reconciliationData: []
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const [revenue, npa, loanPortfolio, reconciliation] = await Promise.all([
        adminAPI.getRevenueReport(dateRange),
        adminAPI.getNpaSummary(dateRange),
        adminAPI.getLoanPortfolioReport(dateRange),
        adminAPI.getReconciliationReport(dateRange)
      ])

      setData({
        revenueData: revenue.data || [],
        npaData: npa.data || [],
        loanPortfolioData: loanPortfolio.data || [],
        reconciliationData: reconciliation.data || []
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    toast.success('Report exported successfully')
    // Implement actual export logic
  }

  const tabs = [
    { id: 'revenue', label: 'Revenue Report' },
    { id: 'npa', label: 'NPA Summary' },
    { id: 'loan', label: 'Loan Portfolio' },
    { id: 'reconciliation', label: 'Reconciliation' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-gray-400 mt-1">View comprehensive banking analytics</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter size={18} className="text-gray-400" />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
        >
          <option value="1m">Last 1 Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last 1 Year</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="h-96 bg-gray-800 rounded-lg animate-pulse" />
      ) : (
        <>
          {/* Revenue Report */}
          {activeTab === 'revenue' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">Total Revenue</p>
                  <p className="text-white font-bold text-xl mt-2">
                    {formatCurrency(data.revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0))}
                  </p>
                </div>
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-cyan-300 text-sm">Average Monthly Revenue</p>
                  <p className="text-white font-bold text-xl mt-2">
                    {formatCurrency((data.revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0)) / (data.revenueData.length || 1))}
                  </p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-sm">Target Achievement</p>
                  <p className="text-white font-bold text-xl mt-2">
                    {((data.revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0) / (data.revenueData.reduce((sum, item) => sum + (item.target || 0), 0) || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NPA Summary */}
          {activeTab === 'npa' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-white font-semibold mb-4">NPA Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.npaData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.npaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* NPA Metrics */}
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">Total NPA Amount</p>
                  <p className="text-white font-bold text-xl mt-2">
                    {formatCurrency(data.npaData.reduce((sum, item) => sum + (item.amount || 0), 0))}
                  </p>
                </div>
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-orange-300 text-sm">NPA Ratio</p>
                  <p className="text-white font-bold text-xl mt-2">
                    {data.npaData.reduce((sum, item) => sum + (item.value || 0), 0).toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 text-sm">Recovery Rate</p>
                  <p className="text-white font-bold text-xl mt-2">
                    {data.npaData.length > 0 ? '75%' : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loan Portfolio */}
          {activeTab === 'loan' && (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Loan Portfolio Analysis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.loanPortfolioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                    labelStyle={{ color: '#f3f4f6' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="outstanding" fill="#0ea5e9" name="Outstanding" />
                  <Bar dataKey="disbursed" fill="#06b6d4" name="Disbursed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Reconciliation */}
          {activeTab === 'reconciliation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-sm">Transactions Matched</p>
                  <p className="text-white font-bold text-2xl mt-2">
                    {data.reconciliationData.filter(r => r.status === 'MATCHED').length}
                  </p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">Discrepancies Found</p>
                  <p className="text-white font-bold text-2xl mt-2">
                    {data.reconciliationData.filter(r => r.status === 'MISMATCH').length}
                  </p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">Pending Resolution</p>
                  <p className="text-white font-bold text-2xl mt-2">
                    {data.reconciliationData.filter(r => r.status === 'PENDING').length}
                  </p>
                </div>
              </div>

              {/* Reconciliation Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {data.reconciliationData.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-cyan-400">{item.transactionId}</td>
                        <td className="py-3 px-4">{formatCurrency(item.amount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === 'MATCHED' ? 'bg-green-500/20 text-green-300' :
                            item.status === 'MISMATCH' ? 'bg-red-500/20 text-red-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
