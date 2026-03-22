import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, User, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { adminAPI } from '../../services/endpoints/admin'

const roleColors = {
  'ROLE_MANAGER': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  'ROLE_EMPLOYEE': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  'ROLE_AUDITOR': 'bg-amber-500/20 text-amber-300 border-amber-500/50'
}

const statusColors = {
  'ACTIVE': 'bg-green-500/20 text-green-300 border-green-500/50',
  'INACTIVE': 'bg-red-500/20 text-red-300 border-red-500/50'
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'ROLE_EMPLOYEE',
    branchId: '',
    department: '',
    salary: '',
    joinDate: ''
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getEmployees()
      // Response is paginated: { content: [...], pageable: {...} }
      setEmployees(response.data?.content || response.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load employees')
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
    if (!formData.firstName || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      if (editingEmployee) {
        await adminAPI.updateEmployee(editingEmployee.id, formData)
        toast.success('Employee updated successfully')
      } else {
        await adminAPI.createEmployee(formData)
        toast.success('Employee created successfully')
      }
      setShowForm(false)
      setEditingEmployee(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'ROLE_EMPLOYEE',
        branchId: '',
        department: '',
        salary: '',
        joinDate: ''
      })
      fetchEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      branchId: employee.branchId,
      department: employee.department,
      salary: employee.salary,
      joinDate: employee.joinDate
    })
    setShowForm(true)
  }

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      await adminAPI.updateEmployeeStatus(employeeId, newStatus)
      toast.success(`Employee status updated to ${newStatus}`)
      fetchEmployees()
    } catch (error) {
      toast.error('Failed to update employee status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return
    try {
      await adminAPI.deleteEmployee(id)
      toast.success('Employee deleted successfully')
      fetchEmployees()
    } catch (error) {
      toast.error('Failed to delete employee')
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingEmployee(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'ROLE_EMPLOYEE',
      branchId: '',
      department: '',
      salary: '',
      joinDate: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Employee Management</h2>
          <p className="text-gray-400 mt-1">Manage all employees across branches</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
      ) : employees.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No employees found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Role</th>
                <th className="text-left py-3 px-4 font-semibold">Department</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-right py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <span className="font-medium text-white">{employee.firstName} {employee.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    {employee.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[employee.role] || ''}`}>
                      {employee.role?.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="py-3 px-4">{employee.department || '-'}</td>
                  <td className="py-3 px-4">
                    <select
                      value={employee.status || 'ACTIVE'}
                      onChange={(e) => handleStatusChange(employee.id, e.target.value)}
                      className={`px-3 py-1 rounded text-xs font-semibold border focus:outline-none cursor-pointer ${statusColors[employee.status || 'ACTIVE'] || ''}`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="employee@nex pay.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="10-digit phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ROLE_EMPLOYEE">Employee</option>
                    <option value="ROLE_MANAGER">Manager</option>
                    <option value="ROLE_AUDITOR">Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., Operations"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Salary</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Join Date</label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Create Employee'}
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
