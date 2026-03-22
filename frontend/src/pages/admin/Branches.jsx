import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Users, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { adminAPI } from '../../services/endpoints/admin'
import { formatDate } from '../../utils/formatting'

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    ifscCode: '',
    managerName: '',
    managerPhone: '',
    staffCount: '',
    workingHours: '09:00-18:00'
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getBranches()
      setBranches(response.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.address || !formData.city || !formData.ifscCode) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      if (editingBranch) {
        await adminAPI.updateBranch(editingBranch.id, formData)
        toast.success('Branch updated successfully')
      } else {
        await adminAPI.createBranch(formData)
        toast.success('Branch created successfully')
      }
      setShowForm(false)
      setEditingBranch(null)
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        ifscCode: '',
        managerName: '',
        managerPhone: '',
        staffCount: '',
        workingHours: '09:00-18:00'
      })
      fetchBranches()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      pincode: branch.pincode,
      ifscCode: branch.ifscCode,
      managerName: branch.managerName,
      managerPhone: branch.managerPhone,
      staffCount: branch.staffCount,
      workingHours: branch.workingHours
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return
    try {
      await adminAPI.deleteBranch(id)
      toast.success('Branch deleted successfully')
      fetchBranches()
    } catch (error) {
      toast.error('Failed to delete branch')
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingBranch(null)
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      ifscCode: '',
      managerName: '',
      managerPhone: '',
      staffCount: '',
      workingHours: '09:00-18:00'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Branch Management</h2>
          <p className="text-gray-400 mt-1">Manage all bank branches</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          Add Branch
        </button>
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No branches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{branch.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={14} />
                    {branch.city}, {branch.state}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <p><span className="text-gray-400">IFSC Code:</span> {branch.ifscCode}</p>
                <p><span className="text-gray-400">Address:</span> {branch.address}</p>
                <p><span className="text-gray-400">Pincode:</span> {branch.pincode}</p>
                <p className="flex items-center gap-2">
                  <Users size={14} />
                  <span className="text-gray-400">Staff:</span> {branch.staffCount || 0}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} />
                  <span className="text-gray-400">Hours:</span> {branch.workingHours}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Branch Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., Mumbai Main Branch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IFSC Code *</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., NEXB0000001"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="400001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Manager Name</label>
                  <input
                    type="text"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Manager name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Manager Phone</label>
                  <input
                    type="tel"
                    name="managerPhone"
                    value={formData.managerPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="10-digit phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Staff Count</label>
                  <input
                    type="number"
                    name="staffCount"
                    value={formData.staffCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Working Hours</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="09:00-18:00"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
