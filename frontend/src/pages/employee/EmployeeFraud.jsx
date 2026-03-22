import React, { useState, useEffect } from 'react'
import { AlertTriangle, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '../../utils/formatting'

const statusColors = {
  'NEW': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  'INVESTIGATING': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  'RESOLVED': 'bg-green-500/20 text-green-300 border-green-500/50',
  'REJECTED': 'bg-red-500/20 text-red-300 border-red-500/50'
}

const severityColors = {
  'LOW': 'bg-blue-500/10 text-blue-300',
  'MEDIUM': 'bg-yellow-500/10 text-yellow-300',
  'HIGH': 'bg-orange-500/10 text-orange-300',
  'CRITICAL': 'bg-red-500/10 text-red-300'
}

export default function EmployeeFraud() {
  const [fraudCases, setFraudCases] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchFraudCases()
  }, [filterStatus])

  const fetchFraudCases = async () => {
    setLoading(true)
    try {
      // Mock fraud cases data - in production this would come from API
      const mockCases = [
        {
          id: 1,
          caseNumber: 'FRAUD-2024-001',
          customerName: 'Rajesh Kumar',
          amount: 50000,
          type: 'Unauthorized Transaction',
          status: 'INVESTIGATING',
          severity: 'HIGH',
          reportedDate: new Date('2024-03-15'),
          description: 'Customer reported unauthorized withdrawal from ATM in Delhi',
          evidence: ['Bank Statement', 'CCTV Footage'],
          investigationNotes: 'Security team reviewing ATM footage from the reported time'
        },
        {
          id: 2,
          caseNumber: 'FRAUD-2024-002',
          customerName: 'Priya Sharma',
          amount: 25000,
          type: 'Duplicate Charge',
          status: 'RESOLVED',
          severity: 'MEDIUM',
          reportedDate: new Date('2024-03-10'),
          description: 'Transaction charged twice for online purchase',
          evidence: ['Transaction ID', 'Receipt'],
          investigationNotes: 'Duplicate charge identified and reversed. Refund processed.'
        },
        {
          id: 3,
          caseNumber: 'FRAUD-2024-003',
          customerName: 'Amit Patel',
          amount: 75000,
          type: 'Card Fraud',
          status: 'NEW',
          severity: 'CRITICAL',
          reportedDate: new Date('2024-03-20'),
          description: 'Multiple unauthorized transactions detected on credit card',
          evidence: ['Card Statements', 'PAN Details'],
          investigationNotes: 'Pending investigation initiation'
        },
        {
          id: 4,
          caseNumber: 'FRAUD-2024-004',
          customerName: 'Neha Singh',
          amount: 15000,
          type: 'Phishing',
          status: 'RESOLVED',
          severity: 'MEDIUM',
          reportedDate: new Date('2024-03-08'),
          description: 'Customer fell victim to phishing attack',
          evidence: ['Email Evidence', 'Transaction Log'],
          investigationNotes: 'Account secured and customer educated on phishing risks'
        },
        {
          id: 5,
          caseNumber: 'FRAUD-2024-005',
          customerName: 'Vikram Desai',
          amount: 35000,
          type: 'Identity Theft',
          status: 'INVESTIGATING',
          severity: 'CRITICAL',
          reportedDate: new Date('2024-03-18'),
          description: 'Suspected identity theft - account accessed from unusual location',
          evidence: ['IP Log', 'Device Info', 'Location Data'],
          investigationNotes: 'Contacting customer for verification details'
        }
      ]
      
      let filtered = mockCases
      if (filterStatus !== 'ALL') {
        filtered = mockCases.filter(c => c.status === filterStatus)
      }
      setFraudCases(filtered)
    } catch (error) {
      toast.error('Failed to load fraud cases')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (caseId, newStatus) => {
    try {
      // In production, would call API
      setFraudCases(fraudCases.map(c => 
        c.id === caseId ? { ...c, status: newStatus } : c
      ))
      toast.success(`Fraud case status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update case status')
    }
  }

  const filteredCases = fraudCases.filter(fraudCase =>
    fraudCase.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fraudCase.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fraudCase.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: fraudCases.length,
    new: fraudCases.filter(c => c.status === 'NEW').length,
    investigating: fraudCases.filter(c => c.status === 'INVESTIGATING').length,
    resolved: fraudCases.filter(c => c.status === 'RESOLVED').length,
    totalAmount: fraudCases.reduce((sum, c) => sum + c.amount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Fraud Case Management</h2>
        <p className="text-gray-400 mt-1">Investigate and resolve fraud cases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs">Total Cases</p>
          <p className="text-white font-bold text-lg mt-1">{stats.total}</p>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-blue-300 text-xs">New</p>
          <p className="text-blue-400 font-bold text-lg mt-1">{stats.new}</p>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-300 text-xs">Investigating</p>
          <p className="text-yellow-400 font-bold text-lg mt-1">{stats.investigating}</p>
        </div>
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-green-300 text-xs">Resolved</p>
          <p className="text-green-400 font-bold text-lg mt-1">{stats.resolved}</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          <p className="text-red-300 text-xs">Total Amount</p>
          <p className="text-red-400 font-bold text-sm mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by case number, customer, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Cases</option>
          <option value="NEW">New</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Fraud Cases List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No fraud cases found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map(fraudCase => (
            <div
              key={fraudCase.id}
              className="p-5 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer"
              onClick={() => {
                setSelectedCase(fraudCase)
                setShowDetails(true)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-semibold">{fraudCase.caseNumber}</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${statusColors[fraudCase.status] || ''}`}>
                      {fraudCase.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColors[fraudCase.severity] || ''}`}>
                      {fraudCase.severity}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Customer: {fraudCase.customerName} • Type: {fraudCase.type}</p>
                </div>
                <p className="text-red-400 font-bold text-lg ml-4">{formatCurrency(fraudCase.amount)}</p>
              </div>
              <p className="text-gray-300 text-sm line-clamp-2">{fraudCase.description}</p>
              <p className="text-gray-500 text-xs mt-2">Reported: {formatDate(fraudCase.reportedDate)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Case Details Modal */}
      {showDetails && selectedCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedCase.caseNumber}</h3>
                <p className="text-gray-400 text-sm">Case Management</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Case Header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedCase.status] || ''}`}>
                    {selectedCase.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityColors[selectedCase.severity] || ''}`}>
                    {selectedCase.severity} Severity
                  </span>
                </div>
                <h4 className="text-white font-semibold mb-4">{selectedCase.customerName}</h4>
              </div>

              {/* Case Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Fraud Type</p>
                  <p className="text-white font-semibold">{selectedCase.type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-red-400 font-bold text-lg">{formatCurrency(selectedCase.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Reported Date</p>
                  <p className="text-white">{formatDate(selectedCase.reportedDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <select
                    value={selectedCase.status}
                    onChange={(e) => handleStatusUpdate(selectedCase.id, e.target.value)}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="NEW">New</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-700 pt-6">
                <p className="text-gray-400 text-sm mb-2">Description</p>
                <p className="text-gray-300 bg-gray-800 p-4 rounded">{selectedCase.description}</p>
              </div>

              {/* Investigation Notes */}
              <div className="border-t border-gray-700 pt-6">
                <p className="text-gray-400 text-sm mb-2">Investigation Notes</p>
                <textarea
                  defaultValue={selectedCase.investigationNotes}
                  placeholder="Add investigation notes..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                  rows="4"
                />
              </div>

              {/* Evidence */}
              <div className="border-t border-gray-700 pt-6">
                <p className="text-gray-400 text-sm mb-3">Evidence</p>
                <div className="space-y-2">
                  {selectedCase.evidence?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-800 rounded border border-gray-700">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-700 pt-6 flex gap-2">
                <button
                  onClick={() => toast.success('Case notes saved')}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => toast.success('Investigation assigned')}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  Assign Investigation
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
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
