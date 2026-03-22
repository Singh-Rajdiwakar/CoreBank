import React, { useState, useEffect } from 'react'
import { Search, Users, TrendingUp, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { transferAPI } from '../../services/endpoints/transfers'
import { accountAPI } from '../../services/endpoints/accounts'
import { formatCurrency, formatDate } from '../../utils/formatting'

export default function ManagerCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [customerAccounts, setCustomerAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      // Fetch pending transfers to get customer list
      const response = await transferAPI.getPending()
      const transfers = response.data?.data || []
      
      // Extract unique customers from transfers
      const uniqueCustomers = {}
      transfers.forEach(transfer => {
        if (transfer.fromAccount?.customer?.id && !uniqueCustomers[transfer.fromAccount.customer.id]) {
          uniqueCustomers[transfer.fromAccount.customer.id] = {
            id: transfer.fromAccount.customer.id,
            firstName: transfer.fromAccount.customer.firstName,
            lastName: transfer.fromAccount.customer.lastName,
            email: transfer.fromAccount.customer.email,
            phone: transfer.fromAccount.customer.phone,
            totalBalance: transfer.fromAccount?.availableBalance || 0,
            transferCount: 1
          }
        }
      })

      setCustomers(Object.values(uniqueCustomers))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer)
    setAccountsLoading(true)
    try {
      const response = await accountAPI.getAccounts()
      // Filter accounts for the selected customer
      const filtered = response.data?.data?.filter(acc => acc.customerId === customer.id) || []
      setCustomerAccounts(filtered)
      setShowDetails(true)
    } catch (error) {
      toast.error('Failed to load customer accounts')
    } finally {
      setAccountsLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Assigned Customers</h2>
        <p className="text-gray-400 mt-1">Manage customers with pending transfers</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No customers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <div
              key={customer.id}
              className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer"
              onClick={() => handleViewDetails(customer)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {customer.firstName?.[0]}{customer.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-gray-400 text-xs">{customer.transferCount} pending transfer{customer.transferCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-500" />
                  {customer.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-500" />
                  {customer.phone}
                </p>
                <div className="pt-2 border-t border-gray-700">
                  <p className="flex items-center gap-2 text-green-400">
                    <TrendingUp size={14} />
                    <span className="font-semibold">{formatCurrency(customer.totalBalance)}</span>
                  </p>
                  <p className="text-xs text-gray-400">Total Balance</p>
                </div>
              </div>

              <button className="mt-4 w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/50 rounded-lg text-sm font-semibold transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
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
              <div>
                <h4 className="text-white font-semibold mb-4">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-green-400 font-bold">{formatCurrency(selectedCustomer.totalBalance)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Pending Transfers</p>
                    <p className="text-yellow-400 font-bold">{selectedCustomer.transferCount}</p>
                  </div>
                </div>
              </div>

              {/* Accounts Section */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-white font-semibold mb-4">Linked Accounts</h4>
                {accountsLoading ? (
                  <div className="h-32 bg-gray-800 rounded-lg animate-pulse" />
                ) : customerAccounts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No accounts found</p>
                ) : (
                  <div className="space-y-3">
                    {customerAccounts.map(account => (
                      <div
                        key={account.id}
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">●●●●●●{account.accountNumber?.slice(-4)}</p>
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">{account.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Account Type</p>
                            <p className="text-gray-300">{account.accountType}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Available Balance</p>
                            <p className="text-gray-300 font-semibold">{formatCurrency(account.availableBalance)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
