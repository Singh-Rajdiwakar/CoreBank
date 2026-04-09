import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { adminAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';

// Icons
const PencilSquareIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>;
const ChartBarIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" /></svg>;
const BuildingOfficeIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const AdminBranches = () => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'performance'
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [expandedBranch, setExpandedBranch] = useState(null);
  
  // Side Panel
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', ifscCode: '', city: '', managerUserId: '' });

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  // Employee Modal
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ userId: '', employeeCode: '' });

  // Expanding branch data
  const [branchEmployees, setBranchEmployees] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Performance Data
  const [performanceData, setPerformanceData] = useState([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchBranches();
    } else if (activeTab === 'performance') {
      fetchPerformance();
    }
  }, [activeTab]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getBranches();
      setBranches(Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : (response.data?.data?.content || response.data?.content || [])));
    } catch (err) {
      console.error('Fetch branches error', err);
    }
    setLoading(false);
  };

  const fetchPerformance = async () => {
    setLoadingPerformance(true);
    try {
      const response = await adminAPI.getBranchPerformance();
      const payload = response.data;
      setPerformanceData(Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : (payload?.data?.content || payload?.content || [])));
    } catch (err) {
      console.error('Fetch performance error', err);
      showNotification('Error loading performance data', 'error');
    }
    setLoadingPerformance(false);
  };

  const showNotification = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    
    const name = (newBranch.name || '').toString().trim();
    const ifscCode = (newBranch.ifscCode || '').toString().trim();
    const city = (newBranch.city || '').toString().trim();
    const managerUserId = newBranch.managerUserId ? (newBranch.managerUserId || '').toString().trim() : '';

    if (!name || !ifscCode || !city) {
      showNotification('Fields cannot be empty or just spaces', 'error');
      return;
    }

    try {
      const resp = await adminAPI.createBranch({
        ...newBranch,
        name,
        ifscCode,
        city,
        managerUserId
      });
      setBranches([...branches, resp.data]);
      setIsSlideOverOpen(false);
      setNewBranch({ name: '', ifscCode: '', city: '', managerUserId: '' });
      showNotification('Branch created successfully', 'success');
    } catch (err) {
      showNotification('Error creating branch', 'error');
    }
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();

    const name = (editingBranch.name || '').toString().trim();
    const ifscCode = (editingBranch.ifscCode || '').toString().trim();
    const city = (editingBranch.city || '').toString().trim();

    if (!name || !ifscCode || !city) {
      showNotification('Fields cannot be empty or just spaces', 'error');
      return;
    }

    try {
      const payload = {
        ...editingBranch,
        name,
        ifscCode,
        city
      };
      const resp = await adminAPI.updateBranch(editingBranch.id, payload);
      // Update local state
      setBranches(branches.map(b => b.id === editingBranch.id ? resp.data : b));
      setIsEditModalOpen(false);
      setEditingBranch(null);
      showNotification('Branch updated successfully', 'success');
    } catch (err) {
      showNotification('Error updating branch', 'error');
    }
  };

  const toggleExpand = async (branchId) => {
    if (expandedBranch === branchId) {
      setExpandedBranch(null);
    } else {
      setExpandedBranch(branchId);
      if (!branchEmployees[branchId]) {
        fetchEmployees(branchId);
      }
    }
  };

  const fetchEmployees = async (branchId) => {
    setLoadingEmployees(true);
    try {
      const resp = await adminAPI.getBranchEmployees(branchId);
      const empsData = Array.isArray(resp.data) ? resp.data : (Array.isArray(resp.data?.data) ? resp.data.data : (resp.data?.data?.content || resp.data?.content || []));
      setBranchEmployees((prev) => ({ ...prev, [branchId]: empsData }));
    } catch (err) {
      console.error('Fetch employees error', err);
    }
    setLoadingEmployees(false);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    const userId = (newEmployee.userId || '').toString().trim();
    const employeeCode = (newEmployee.employeeCode || '').toString().trim();

    if (!userId || !employeeCode) {
      showNotification('Fields cannot be empty or just spaces', 'error');
      return;
    }

    try {
      const resp = await adminAPI.addEmployee({
        ...newEmployee,
        userId,
        employeeCode,
        branchId: targetBranchId,
      });
      if (branchEmployees[targetBranchId]) {
        setBranchEmployees({
          ...branchEmployees,
          [targetBranchId]: [...branchEmployees[targetBranchId], resp.data],
        });
      }
      setIsAddEmployeeOpen(false);
      setNewEmployee({ userId: '', employeeCode: '' });
      showNotification('Employee added successfully', 'success');
    } catch (err) {
      showNotification('Error adding employee', 'error');
    }
  };

  const handleToggleStatus = async (employeeId, currentStatus, branchId) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminAPI.updateEmployeeStatus(employeeId, newStatus);
      const updatedList = branchEmployees[branchId].map((emp) =>
        emp.id === employeeId ? { ...emp, status: newStatus } : emp
      );
      setBranchEmployees({ ...branchEmployees, [branchId]: updatedList });
      showNotification(`Employee ${newStatus.toLowerCase()} successfully`, 'success');
    } catch (err) {
      showNotification('Error updating status', 'error');
    }
  };

  // Compute maximums for progress bars
  const maxCustomers = Math.max(...performanceData.map(d => d.totalCustomers || 0), 1);
  const maxAccounts = Math.max(...performanceData.map(d => d.totalAccounts || 0), 1);
  const maxVolume = Math.max(...performanceData.map(d => d.transferVolume || 0), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-500 mt-1">Manage global branches, assign specialized staff, and monitor performance.</p>
        </div>
        {activeTab === 'directory' && (
          <button
            onClick={() => setIsSlideOverOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm font-medium transition-colors whitespace-nowrap self-start"
          >
            + New Branch
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('directory')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'directory' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <BuildingOfficeIcon className={`mr-2 h-5 w-5 ${activeTab === 'directory' ? 'text-blue-500' : 'text-gray-400'}`} />
            Branch Directory
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'performance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <ChartBarIcon className={`mr-2 h-5 w-5 ${activeTab === 'performance' ? 'text-blue-500' : 'text-gray-400'}`} />
            Performance Analytics
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          
          {/* BRANCH DIRECTORY */}
          {activeTab === 'directory' && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IFSC</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading branches...</td></tr>
                    ) : branches.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-400">No branches recorded.</td></tr>
                    ) : (
                      branches.map((branch) => (
                        <React.Fragment key={branch.id}>
                          <tr className={`hover:bg-gray-50 transition-colors ${expandedBranch === branch.id ? 'bg-blue-50/30' : ''}`}>
                            <td className="px-6 py-4 font-semibold text-gray-900">{branch.name}</td>
                            <td className="px-6 py-4 text-gray-600 font-mono tracking-wider text-sm">{branch.ifscCode}</td>
                            <td className="px-6 py-4 text-gray-600">{branch.city}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-3 items-center">
                              <button
                                onClick={() => {
                                  setEditingBranch(branch);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                title="Edit Branch"
                              >
                                <PencilSquareIcon className="w-5 h-5"/>
                              </button>
                              <button
                                onClick={() => toggleExpand(branch.id)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                {expandedBranch === branch.id ? 'Hide Staff' : 'View Staff'}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Employee Panel */}
                          <AnimatePresence>
                            {expandedBranch === branch.id && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-b border-gray-100 bg-gray-50/50 overflow-hidden text-clip"
                              >
                                <td colSpan="5" className="px-6">
                                  <div className="py-4 px-2">
                                    <div className="flex justify-between items-center mb-4">
                                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Assigned Staff</h3>
                                      <button
                                        onClick={() => {
                                          setTargetBranchId(branch.id);
                                          setIsAddEmployeeOpen(true);
                                        }}
                                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-md font-bold transition-colors"
                                      >
                                        + Assign Employee
                                      </button>
                                    </div>

                                    {loadingEmployees && !branchEmployees[branch.id] ? (
                                      <div className="text-center py-4 text-sm text-gray-500">Loading staff directory...</div>
                                    ) : (
                                      <div className="grid gap-3">
                                        {(!branchEmployees[branch.id] || branchEmployees[branch.id].length === 0) ? (
                                          <div className="text-sm text-gray-500 py-3 text-center border border-dashed border-gray-300 rounded-lg">
                                            No staff assigned to this branch yet.
                                          </div>
                                        ) : (
                                          branchEmployees[branch.id].map((emp) => (
                                            <div key={emp.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                                                  {String(emp?.employeeCode || '').slice(0, 2)}
                                                </div>
                                                <div>
                                                  <p className="text-sm font-bold text-gray-900 font-mono">{emp.employeeCode}</p>
                                                  <p className="text-xs text-gray-500">Assigned User ID: {emp.userId}</p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-4">
                                                <span className={`text-xs px-2 py-1 rounded-md font-semibold ${emp.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                  {emp.status}
                                                </span>
                                                <button
                                                  onClick={() => handleToggleStatus(emp.id, emp.status, branch.id)}
                                                  className={`text-xs px-3 py-1.5 border rounded-md font-medium transition-colors ${
                                                    emp.status === 'ACTIVE'
                                                      ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                                      : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                                                  }`}
                                                >
                                                  {emp.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                                                </button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* PERFORMANCE DASHBOARD */}
          {activeTab === 'performance' && (
             <motion.div
              key="performance"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6"
             >
               <h3 className="text-lg font-bold text-gray-900 mb-6">Branch Performance Metrics</h3>
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Details</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customers</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Accounts</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transfer Volume</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingPerformance ? (
                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">Evaluating performance data...</td></tr>
                      ) : performanceData.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-8 text-gray-400">No performance data found.</td></tr>
                      ) : (
                        // Sort by volume
                        [...performanceData].sort((a,b) => (b.transferVolume || 0) - (a.transferVolume || 0)).map((data, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                             <td className="px-6 py-5">
                               <p className="font-bold text-gray-900">{data.branchName}</p>
                               <p className="text-xs text-gray-500 uppercase font-mono mt-1">{data.ifscCode}</p>
                             </td>
                             <td className="px-6 py-5 align-middle">
                               <div className="flex items-center justify-between mb-1">
                                 <span className="text-sm font-semibold text-gray-700">{data.totalCustomers || 0}</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-1.5 flex">
                                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(((data.totalCustomers || 0) / maxCustomers) * 100, 100)}%` }}></div>
                               </div>
                             </td>
                             <td className="px-6 py-5 align-middle">
                               <div className="flex items-center justify-between mb-1">
                                 <span className="text-sm font-semibold text-gray-700">{data.totalAccounts || 0}</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-1.5 flex">
                                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(((data.totalAccounts || 0) / maxAccounts) * 100, 100)}%` }}></div>
                               </div>
                             </td>
                             <td className="px-6 py-5 align-middle w-1/4">
                               <div className="flex items-center justify-between mb-1">
                                 <span className="text-sm font-bold text-green-600">{formatCurrency(data.transferVolume || 0)}</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-1.5 flex">
                                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(((data.transferVolume || 0) / maxVolume) * 100, 100)}%` }}></div>
                               </div>
                             </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                 </table>
               </div>
             </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Edit Branch Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Edit Branch</h3>
              <p className="text-sm text-gray-500 mb-6">Modify operational details for {editingBranch.ifscCode}</p>
              
              <form onSubmit={handleUpdateBranch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                  <input 
                    type="text" required
                    value={editingBranch.name} onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Downtown Metro Hub"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input 
                    type="text" required
                    value={editingBranch.ifscCode} onChange={(e) => setEditingBranch({...editingBranch, ifscCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                    placeholder="NEXP0001234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City / Region</label>
                  <input 
                    type="text" required
                    value={editingBranch.city} onChange={(e) => setEditingBranch({...editingBranch, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager User ID</label>
                  <input 
                    type="number"
                    value={editingBranch.managerUserId || ''} onChange={(e) => setEditingBranch({...editingBranch, managerUserId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Target manager system ID"
                  />
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAddEmployeeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Assign Employee to Branch</h3>
              <p className="text-sm text-gray-500 mb-6">Enter user properties to grant them staff-level status.</p>
              
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 tracking-wider uppercase">User ID</label>
                  <input 
                    type="number" required
                    value={newEmployee.userId} onChange={(e) => setNewEmployee({...newEmployee, userId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="System ID of User"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 tracking-wider uppercase">Employee Code</label>
                  <input 
                    type="text" required
                    value={newEmployee.employeeCode} onChange={(e) => setNewEmployee({...newEmployee, employeeCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                    placeholder="EMP001"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddEmployeeOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                    Assign Staff
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

export default AdminBranches;
