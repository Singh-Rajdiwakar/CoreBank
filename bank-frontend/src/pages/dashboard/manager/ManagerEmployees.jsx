import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';

const ManagerEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    userId: '',
    branchId: '',
    employeeCode: '',
    manager: false
  });

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const resp = await adminAPI.getEmployees();
      const empData = Array.isArray(resp.data) ? resp.data : (Array.isArray(resp.data?.data) ? resp.data.data : (resp.data?.data?.content || resp.data?.content || []));
      setEmployees(empData);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const resp = await adminAPI.getBranches();
      const branchData = Array.isArray(resp.data) ? resp.data : (Array.isArray(resp.data?.data) ? resp.data.data : (resp.data?.data?.content || resp.data?.content || []));
      setBranches(branchData);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleToggleStatus = async (employeeId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminAPI.updateEmployeeStatus(employeeId, newStatus);
      showNotification(`Employee marked as ${newStatus}`, 'success');
      fetchEmployees();
    } catch (err) {
      console.error('Failed to change status', err);
      showNotification('Failed to update employee status', 'error');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.userId || !newEmployee.branchId || !newEmployee.employeeCode) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const payload = {
        userId: Number(newEmployee.userId),
        branchId: Number(newEmployee.branchId),
        employeeCode: newEmployee.employeeCode,
        manager: newEmployee.manager
      };
      
      await adminAPI.addEmployee(payload);
      showNotification('Employee added successfully', 'success');
      setIsAddModalOpen(false);
      setNewEmployee({ userId: '', branchId: '', employeeCode: '', manager: false });
      fetchEmployees();
    } catch (err) {
      console.error('Failed to add employee', err);
      showNotification('Failed to add employee (user may already be assigned or not exist)', 'error');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const term = searchQuery.toLowerCase();
    return (
        String(emp.employeeCode || '').toLowerCase().includes(term) ||
        String(emp.branchName || '').toLowerCase().includes(term) ||
        String(emp.userId || '').includes(term) ||
        String(emp.status || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff / Employees Overview</h1>
          <p className="text-gray-500 mt-1">Manage bank employees, managers, and operational staff.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Assign New Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by Code, Branch, or User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={fetchEmployees} className="text-gray-400 hover:text-blue-600 transition-colors" title="Refresh Staff List">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mapped User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      Loading staff records...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No employees found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{emp.employeeCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.manager ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Manager</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Clerk / Staff</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {emp.branchName || `Branch #${emp.branchId}`}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        @{emp.username} <span className="text-gray-400 font-normal text-xs">(ID: {emp.userId})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleToggleStatus(emp.id, emp.status)}
                        className={`font-medium ${emp.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {emp.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Assign System Staff</h3>
              <p className="text-sm text-gray-500 mb-6">Promote an existing system user to a branch staff member.</p>
              
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target User ID *</label>
                  <input 
                    type="number" required
                    value={newEmployee.userId} onChange={(e) => setNewEmployee({...newEmployee, userId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                    placeholder="Enter existing User ID (e.g. 15)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Branch *</label>
                  <select 
                    required value={newEmployee.branchId} 
                    onChange={(e) => setNewEmployee({...newEmployee, branchId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                  >
                    <option value="" disabled>-- Select a Branch --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.ifscCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unique Employee Code *</label>
                  <input 
                    type="text" required
                    value={newEmployee.employeeCode} onChange={(e) => setNewEmployee({...newEmployee, employeeCode: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 uppercase"
                    placeholder="e.g. EMP-9122"
                  />
                </div>

                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                   <div className="flex items-center h-5">
                      <input
                        id="is_manager_checkbox"
                        type="checkbox"
                        checked={newEmployee.manager}
                        onChange={(e) => setNewEmployee({...newEmployee, manager: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                   </div>
                   <div className="flex flex-col">
                      <label htmlFor="is_manager_checkbox" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Is Branch Manager?
                      </label>
                      <p className="text-xs text-gray-500">Grants Manager-level capabilities within this branch.</p>
                   </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                    Assign Staff Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManagerEmployees;
