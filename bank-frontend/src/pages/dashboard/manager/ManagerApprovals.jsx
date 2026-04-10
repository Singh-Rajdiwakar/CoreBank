import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { managerAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';

const ManagerApprovals = () => {
  const [activeTab, setActiveTab] = useState('transfers'); // 'transfers' or 'accounts'
  
  const [transfers, setTransfers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // Reset selection when tab changes
    setSelectedTransfer(null);
    setSelectedAccount(null);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'transfers') {
        const response = await managerAPI.getPendingTransfers();
        setTransfers(Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : (response.data?.data?.content || response.data?.content || [])));
      } else {
        // Attempt to fetch pending accounts if the endpoint exists
        try {
          const response = await managerAPI.getPendingAccounts();
          setAccounts(Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : (response.data?.data?.content || response.data?.content || [])));
        } catch (e) {
          // Fallback if backend isn't ready
          console.warn("Could not fetch accounts:", e);
          setAccounts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to fetch pending items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const currentSelectionName = () => {
    if (activeTab === 'transfers' && selectedTransfer) return `Transfer ${selectedTransfer.reference || selectedTransfer.id}`;
    if (activeTab === 'accounts' && selectedAccount) return `Account ${selectedAccount.accountNumber || selectedAccount.id}`;
    return 'Item';
  };

  const handleActionClick = (action) => {
    setModalAction(action);
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      showToast('Remarks are required to proceed.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === 'transfers') {
        if (modalAction === 'approve') {
          await managerAPI.approveTransfer(selectedTransfer.id, remarks);
        } else {
          await managerAPI.rejectTransfer(selectedTransfer.id, remarks);
        }
        setTransfers(prev => prev.filter(item => item.id !== selectedTransfer.id));
      } else if (activeTab === 'accounts') {
        // In some systems approve/reject use `approved=true/false` query params. 
        // We'll use the API mapping we set up in api.js: approveAccount / rejectAccount
        if (modalAction === 'approve') {
          await managerAPI.approveAccount(selectedAccount.id, remarks);
        } else {
          await managerAPI.rejectAccount(selectedAccount.id, remarks);
        }
        setAccounts(prev => prev.filter(item => item.id !== selectedAccount.id));
      }
      
      showToast(`${currentSelectionName()} has been ${modalAction}d successfully.`);
      setIsModalOpen(false);
      fetchData(); // Refresh list automatically in background
      if (activeTab === 'transfers') setSelectedTransfer(null);
      if (activeTab === 'accounts') setSelectedAccount(null);

    } catch (error) {
      console.error(error);
      showToast(`Failed to ${modalAction} ${currentSelectionName()}.`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* Header & Tabs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Workspace</h1>
        <p className="text-gray-500 mt-1">Review and manage pending system approvals.</p>
        
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('transfers')}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transfers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Transfers
              {activeTab === 'transfers' && <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">{transfers.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'accounts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Accounts
              {activeTab === 'accounts' && <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">{accounts.length}</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Split-Pane Layout */}
      <div className="flex flex-1 gap-6 overflow-hidden min-h-[500px]">
        
        {/* Left Pane: List */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">
            Queue
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="text-center text-sm text-gray-500 py-8">Loading queue...</div>
            ) : activeTab === 'transfers' ? (
              transfers.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-8">No pending transfers.</div>
              ) : transfers.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTransfer(t)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedTransfer?.id === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{formatCurrency(t.amount)}</span>
                    <span className="text-xs font-mono text-gray-500 uppercase">{t.reference}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">From: {t.sourceAccountNumber}</div>
                </div>
              ))
            ) : (
              accounts.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-8">No pending accounts.</div>
              ) : accounts.map((a) => (
                <div 
                  key={a.id}
                  onClick={() => setSelectedAccount(a)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedAccount?.id === a.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">App #{a.id}</div>
                  <div className="text-sm text-gray-600 mt-1">Customer: {a.customerId}</div>
                  <div className="text-xs text-gray-500 uppercase">{a.accountType}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Details */}
        <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col justify-between overflow-y-auto">
          {activeTab === 'transfers' ? (
            selectedTransfer ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Transfer Details</h2>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Reference</label>
                      <p className="mt-1 text-lg font-mono text-gray-800">{selectedTransfer.reference}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Amount</label>
                      <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(selectedTransfer.amount)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Source Account</label>
                      <p className="mt-1 text-base font-medium text-gray-900">{selectedTransfer.sourceAccountNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Destination Account</label>
                      <p className="mt-1 text-base font-medium text-gray-900">{selectedTransfer.destinationAccountNumber || selectedTransfer.beneficiaryAccountNumber}</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Type</label>
                      <p className="mt-1 text-base text-gray-800">{selectedTransfer.type}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Initiated On</label>
                      <p className="mt-1 text-base text-gray-800">{new Date(selectedTransfer.timestamp || selectedTransfer.createdAt).toLocaleString()}</p>
                    </div>

                    {/* Fraud Score Display */}
                    <div className="col-span-2 mt-4 p-4 border border-orange-200 bg-orange-50 rounded-xl">
                       <label className="text-xs text-orange-800 uppercase tracking-wider font-bold mb-2 block">Fraud Risk Assessment</label>
                       <div className="flex items-center">
                         <div className="flex-1 max-w-sm bg-gray-200 rounded-full h-2 mr-4">
                           <div className={`h-2 rounded-full ${selectedTransfer.fraudScore > 70 ? 'bg-red-500' : selectedTransfer.fraudScore > 40 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(selectedTransfer.fraudScore || 0, 100)}%` }}></div>
                         </div>
                         <span className="font-bold text-orange-900">{selectedTransfer.fraudScore || 0} / 100</span>
                       </div>
                       <p className="text-xs text-orange-700 mt-2">Score evaluated automatically by AI. Proceed with caution if score &gt; 70.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100">
                  <button onClick={() => handleActionClick('reject')} className="flex-1 py-4 text-center rounded-xl font-bold text-red-600 bg-white border-2 border-red-200 hover:border-red-600 hover:bg-red-50 transition-all text-lg">
                    Reject Transfer
                  </button>
                  <button onClick={() => handleActionClick('approve')} className="flex-1 py-4 text-center rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-all text-lg">
                    Approve Transfer
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a transfer from the queue to view details.
              </div>
            )
          ) : (
            selectedAccount ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Account Application</h2>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                       <div>
                         <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Customer ID</label>
                         <p className="mt-1 text-lg font-mono text-gray-800">{selectedAccount.customerId}</p>
                       </div>
                       <div>
                         <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Type</label>
                         <p className="mt-1 text-lg text-gray-800">{selectedAccount.accountType}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100">
                  <button onClick={() => handleActionClick('reject')} className="flex-1 py-4 text-center rounded-xl font-bold text-red-600 bg-white border-2 border-red-200 hover:border-red-600 hover:bg-red-50 transition-all text-lg">
                    Reject Account
                  </button>
                  <button onClick={() => handleActionClick('approve')} className="flex-1 py-4 text-center rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-all text-lg">
                    Approve Account
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select an account from the queue to view details.
              </div>
            )
          )}
        </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
            >
              <h3 className={`text-xl font-bold mb-2 ${modalAction === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
                Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                You are about to <strong className="uppercase">{modalAction}</strong> {currentSelectionName()}. 
                Please provide your required remarks for the audit log.
              </p>
              
              <form onSubmit={handleSubmitAction}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Manager Remarks *</label>
                  <textarea
                    required
                    rows="4"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter reason or comments for this decision..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-gray-800 shadow-sm"
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-center rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 py-3 text-center rounded-xl font-bold text-white shadow-md transition-colors disabled:opacity-50 ${
                      modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {submitting ? 'Processing...' : `Submit ${modalAction === 'approve' ? 'Approval' : 'Rejection'}`}
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

export default ManagerApprovals;
