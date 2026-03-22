import React, { useState, useEffect } from 'react'
import { Search, Ban, AlertCircle, CreditCard, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { adminAPI } from '../../services/endpoints/admin'
import { formatCurrency, formatDate } from '../../utils/formatting'

const statusColors = {
  'ACTIVE': 'bg-green-500/20 text-green-300 border-green-500/50',
  'BLOCKED': 'bg-red-500/20 text-red-300 border-red-500/50',
  'DORMANT': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  'CLOSED': 'bg-gray-500/20 text-gray-300 border-gray-500/50'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getCustomers()
      // Response is paginated: { content: [...], pageable: {...} }
      setCustomers(response.data?.content || response.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleBlockCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to block this customer?')) return
    try {
      await adminAPI.updateCustomerStatus(customerId, 'BLOCKED')
      toast.success('Customer blocked successfully')
      fetchCustomers()
    } catch (error) {
      toast.error('Failed to block customer')
    }
  }

  const handleUnblockCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to unblock this customer?')) return
    try {
      await adminAPI.updateCustomerStatus(customerId, 'ACTIVE')
      toast.success('Customer unblocked successfully')
      fetchCustomers()
    } catch (error) {
      toast.error('Failed to unblock customer')
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customerId?.includes(searchQuery)
  )

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setShowDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Customer Management</h2>
        <p className="text-gray-400 mt-1">View and manage customer accounts</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or customer ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No customers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Customer ID</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Phone</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Total Balance</th>
                <th className="text-right py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {customer.firstName?.[0]}{customer.lastName?.[0]}
                      </div>
                      <span className="font-medium text-white">{customer.firstName} {customer.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{customer.customerId}</td>
                  <td className="py-3 px-4">{customer.email}</td>
                  <td className="py-3 px-4">{customer.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[customer.status] || ''}`}>
                      {customer.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-green-400" />
                      {formatCurrency(customer.totalBalance || 0)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/50 rounded text-xs font-semibold transition-colors"
                      >
                        View Details
                      </button>
                      {customer.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleBlockCustomer(customer.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Block customer"
                        >
                          <Ban size={14} className="text-red-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblockCustomer(customer.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Unblock customer"
                        >
                          <AlertCircle size={14} className="text-yellow-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Customer Details - {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Customer ID</p>
                  <p className="text-white font-semibold font-mono">{selectedCustomer.customerId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${statusColors[selectedCustomer.status] || ''}`}>
                    {selectedCustomer.status || 'ACTIVE'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date of Birth</p>
                  <p className="text-white">{selectedCustomer.dateOfBirth ? formatDate(selectedCustomer.dateOfBirth) : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Registered On</p>
                  <p className="text-white">{formatDate(selectedCustomer.registeredDate)}</p>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-white font-semibold mb-4">Financial Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-green-400 font-bold text-lg">{formatCurrency(selectedCustomer.totalBalance || 0)}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Total Transactions</p>
                    <p className="text-cyan-400 font-bold text-lg">{selectedCustomer.totalTransactions || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Active Loans</p>
                    <p className="text-amber-400 font-bold text-lg">{selectedCustomer.activeLoans || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Outstanding Loan Amount</p>
                    <p className="text-red-400 font-bold text-lg">{formatCurrency(selectedCustomer.outstandingLoanAmount || 0)}</p>
                  </div>
                </div>
              </div>

              {/* KYC Status */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-white font-semibold mb-4">KYC Status</h4>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">PAN Verified</p>
                    <p className="text-white font-semibold">{selectedCustomer.panVerified ? '✓ Yes' : '✗ No'}</p>
                  </div>
                  <div className="flex-1 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">Aadhar Verified</p>
                    <p className="text-white font-semibold">{selectedCustomer.aadharVerified ? '✓ Yes' : '✗ No'}</p>
                  </div>
                  <div className="flex-1 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">Address Verified</p>
                    <p className="text-white font-semibold">{selectedCustomer.addressVerified ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-700 pt-6 flex gap-2">
                {selectedCustomer.status === 'ACTIVE' ? (
                  <button
                    onClick={() => {
                      handleBlockCustomer(selectedCustomer.id)
                      setShowDetails(false)
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                  >
                    Block Customer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUnblockCustomer(selectedCustomer.id)
                      setShowDetails(false)
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                  >
                    Unblock Customer
                  </button>
                )}
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
