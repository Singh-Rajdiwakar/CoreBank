import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle, UserPlus, ShieldAlert, FileText, Settings, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { employeeAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const COLUMNS = [
  { id: 'OPEN', label: 'Open', icon: <AlertCircle className="w-5 h-5 text-yellow-500" /> },
  { id: 'UNDER_REVIEW', label: 'Under Review', icon: <Clock className="w-5 h-5 text-blue-500" /> },
  { id: 'RESOLVED', label: 'Resolved', icon: <CheckCircle className="w-5 h-5 text-green-500" /> }
];

const EmployeeDisputes = () => {
  const { user } = useAuth();
  const [disputesList, setDisputesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [updateStatus, setUpdateStatus] = useState('RESOLVED');
  const [provisionalCredit, setProvisionalCredit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getDisputes();
      setDisputesList(res.data || []);
    } catch (err) {
      console.error('Error fetching disputes:', err);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (disputeId) => {
    try {
      await employeeAPI.assignDispute(disputeId, { assigneeUserId: user?.id });
      setDisputesList(prev => prev.map(d => d.id === disputeId ? { ...d, assignedToUserId: user?.id } : d));
      toast.success('Dispute assigned to you successfully');
      fetchDisputes(); // Refetch in background
    } catch (err) {
      console.error('Error assigning dispute:', err);
      toast.error('Failed to assign dispute');
    }
  };

  const openReviewModal = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionSummary(dispute.resolutionSummary || '');
    setUpdateStatus(dispute.status === 'OPEN' ? 'UNDER_REVIEW' : 'RESOLVED');
    setProvisionalCredit(dispute.provisionalCreditRecommended || false);
  };

  const closeReviewModal = () => {
    setSelectedDispute(null);
    setResolutionSummary('');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setSubmitting(true);
    try {
      const updatedStatus = updateStatus;
      const updatedResolution = resolutionSummary;
      const updatedProvisional = provisionalCredit;
      
      setDisputesList(prev => prev.map(d => 
        d.id === selectedDispute.id 
          ? { ...d, status: updatedStatus, resolutionSummary: updatedResolution, provisionalCreditRecommended: updatedProvisional } 
          : d
      ));

      await employeeAPI.updateDisputeStatus(selectedDispute.id, {
        status: updatedStatus,
        resolutionSummary: updatedResolution,
        provisionalCreditRecommended: updatedProvisional
      });
      toast.success('Dispute updated successfully');
      fetchDisputes(); // Refetch in background
      closeReviewModal();
    } catch (err) {
      console.error('Error updating dispute:', err);
      toast.error('Failed to update dispute');
      // On failure, refetch to revert the optimistic update
      fetchDisputes();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and resolve customer transaction disputes.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {COLUMNS.map(column => (
              <div key={column.id} className="bg-gray-50 rounded-xl p-4 min-h-[500px] border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center space-x-2 mb-4 px-2">
                  {column.icon}
                  <h2 className="font-semibold text-gray-800">{column.label}</h2>
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                    {disputesList.filter(d => d.status === column.id).length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {disputesList.filter(d => d.status === column.id).map(dispute => (
                    <motion.div 
                      key={dispute.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-500">#{dispute.id}</span>
                        <span className="text-sm font-bold text-gray-900">${dispute.amount?.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-3">{dispute.reason}</p>
                      
                      <div className="flex justify-between items-center text-xs mt-4 pt-3 border-t border-gray-50">
                        {dispute.assigneeUserId ? (
                           <span className="text-indigo-600 font-medium">Assigned to: {dispute.assigneeUserId === user?.id ? 'Me' : dispute.assigneeUserId}</span>
                        ) : (
                           <span className="text-gray-400">Unassigned</span>
                        )}
                        <span className="text-gray-500">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        {dispute.status === 'OPEN' && !dispute.assigneeUserId && (
                          <button
                            onClick={() => handleAssign(dispute.id)}
                            className="flex-1 bg-indigo-50 text-indigo-700 py-1.5 rounded text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center"
                          >
                            <UserPlus className="w-3 h-3 mr-1" /> Assign to Me
                          </button>
                        )}
                        {(dispute.assigneeUserId === user?.id || dispute.status !== 'OPEN') && (
                          <button
                            onClick={() => openReviewModal(dispute)}
                            className="flex-1 bg-gray-50 text-gray-700 py-1.5 rounded text-xs font-medium hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center"
                          >
                            <Settings className="w-3 h-3 mr-1" /> Update
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {disputesList.filter(d => d.status === column.id).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No disputes in this status.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Modal */}
        <AnimatePresence>
          {selectedDispute && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <ShieldAlert className="w-5 h-5 text-indigo-600 mr-2" />
                    Update Dispute #{selectedDispute.id}
                  </h3>
                  <button onClick={closeReviewModal} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleStatusUpdate} className="p-6">
                  <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-gray-500 mb-1">Amount</span>
                        <span className="font-bold text-gray-900">${selectedDispute.amount?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Transaction ID</span>
                        <span className="font-mono">{selectedDispute.transactionId?.substring(0,8)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-gray-500 mb-1">Reason for Dispute</span>
                        <span className="text-gray-800">{selectedDispute.reason}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="OPEN">Open</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Provisional Credit Recommended</label>
                        <p className="text-xs text-gray-500">Provide interim credit while investigating.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={provisionalCredit}
                          onChange={(e) => setProvisionalCredit(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Summary</label>
                      <textarea
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-24 resize-none"
                        placeholder="Detail the steps taken and current findings..."
                        required={updateStatus === 'RESOLVED'}
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeReviewModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Save Update
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default EmployeeDisputes;