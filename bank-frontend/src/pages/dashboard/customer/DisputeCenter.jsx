import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { disputeAPI, accountAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';
import FloatingLabelInput from '../../../components/forms/FloatingLabelInput';

const DisputeCenter = () => {
  const { accounts } = useStore();
  const [activeTab, setActiveTab] = useState('LIST'); // 'LIST', 'CREATE', 'TIMELINE'
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // For new dispute
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.accountNumber || '');
  const [transactions, setTransactions] = useState([]);
  const [isFetchingTxs, setIsFetchingTxs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDisputeData, setNewDisputeData] = useState({
    transactionId: '',
    category: 'UNAUTHORIZED',
    priority: 'HIGH',
    description: ''
  });

  // For timeline
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await disputeAPI.getMyDisputes();
      setDisputes(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async (accNumber) => {
    if (!accNumber) return;
    try {
      setIsFetchingTxs(true);
      const res = await accountAPI.getMiniStatement(accNumber);
      setTransactions(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setIsFetchingTxs(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    if (activeTab === 'CREATE' && selectedAccount) {
      fetchRecentTransactions(selectedAccount);
    }
  }, [activeTab, selectedAccount]);

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    if (!newDisputeData.transactionId) return showNotification('Please select a transaction', 'error');
    if (!newDisputeData.description.trim()) return showNotification('Description is required', 'error');

    setIsSubmitting(true);
    try {
      await disputeAPI.createDispute(newDisputeData);
      showNotification('Dispute submitted successfully.', 'success');
      setNewDisputeData({ transactionId: '', category: 'UNAUTHORIZED', priority: 'HIGH', description: '' });
      setActiveTab('LIST');
      fetchDisputes();
    } catch (err) {
      console.error('Failed to create dispute', err);
      showNotification(err.response?.data?.message || 'Failed to submit dispute', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTimeline = async (dispute) => {
    setSelectedDispute(dispute);
    setActiveTab('TIMELINE');
    setLoadingTimeline(true);
    try {
      const res = await disputeAPI.getDisputeTimeline(dispute.id);
      setTimeline(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch timeline', err);
      // fallback
      setTimeline([
        { status: 'OPEN', description: 'Dispute opened and received.', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full tracking-wider">OPEN</span>;
      case 'UNDER_REVIEW':
      case 'INVESTIGATING':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full tracking-wider">UNDER REVIEW</span>;
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full tracking-wider">RESOLVED</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dispute Center</h2>
          <p className="text-gray-500 mt-2">Report unauthorized transactions and track their resolution status.</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-xl shadow-inner">
          <button
            onClick={() => { setActiveTab('LIST'); setSelectedDispute(null); }}
            className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'LIST' || activeTab === 'TIMELINE' ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {(activeTab === 'LIST' || activeTab === 'TIMELINE') && (
              <motion.div layoutId="disputeTabBubble" className="absolute inset-0 bg-white rounded-lg border border-gray-200" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
            <span className="relative z-10">My Disputes</span>
          </button>
          <button
            onClick={() => { setActiveTab('CREATE'); setSelectedDispute(null); }}
            className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'CREATE' ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {activeTab === 'CREATE' && (
              <motion.div layoutId="disputeTabBubble" className="absolute inset-0 bg-white rounded-lg border border-gray-200" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
            <span className="relative z-10">Report Issue</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -15 }}
           transition={{ duration: 0.3 }}
        >
          {/* DISPUTE LIST */}
          {activeTab === 'LIST' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
               {loading ? (
                  <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
               ) : (
                 disputes.length === 0 ? (
                   <div className="text-center py-20 px-6">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">No Disputes Found</h3>
                      <p className="text-gray-500 mt-2 max-w-sm mx-auto">You have no active or past disputes. If you notice any suspicious activity, report it immediately.</p>
                      <button onClick={() => setActiveTab('CREATE')} className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                        Report an Issue
                      </button>
                   </div>
                 ) : (
                   <div className="divide-y border-gray-100">
                     {disputes.map(dispute => (
                       <div key={dispute.id} onClick={() => handleViewTimeline(dispute)} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                           <div className="flex items-center gap-3 mb-2">
                             <span className="font-mono text-sm text-gray-500">#{dispute.id.substring(0,8).toUpperCase()}</span>
                             {getStatusBadge(dispute.status)}
                           </div>
                           <p className="text-gray-900 font-semibold text-lg">{dispute.category}</p>
                           <p className="text-gray-500 text-sm mt-1">{dispute.description.substring(0, 80)}{dispute.description.length > 80 ? '...' : ''}</p>
                         </div>
                         <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center">
                           <span className="text-sm font-medium text-gray-500">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                           <span className="text-blue-600 text-sm font-semibold flex items-center mt-2 group-hover:underline">
                             View Status <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )
               )}
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === 'TIMELINE' && selectedDispute && (
            <div>
              <button onClick={() => setActiveTab('LIST')} className="mb-6 flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Disputes
              </button>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 lg:p-10">
                <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedDispute.category}</h3>
                    <p className="text-gray-500 mt-2 font-mono text-sm">Dispute Ref: #{selectedDispute.id}</p>
                  </div>
                  {getStatusBadge(selectedDispute.status)}
                </div>

                <h4 className="text-lg font-bold text-gray-800 mb-6">Resolution Timeline</h4>
                {loadingTimeline ? (
                   <div className="flex justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                ) : (
                  <div className="relative border-l-2 border-gray-100 ml-3 md:ml-4 space-y-8">
                     {timeline.map((event, idx) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                         key={idx} className="relative pl-8 md:pl-10"
                       >
                         <div className="absolute -left-[9px] md:-left-[11px] top-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white border-2 border-blue-500"></div>
                         <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                           <div className="flex justify-between items-start mb-2">
                             <h5 className="font-bold text-gray-900">{event.status.replace('_', ' ')}</h5>
                             <span className="text-xs font-semibold text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                                {new Date(event.createdAt || selectedDispute.createdAt).toLocaleDateString()}
                             </span>
                           </div>
                           <p className="text-sm text-gray-600">{event.description}</p>
                         </div>
                       </motion.div>
                     ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CREATE DISPUTE */}
          {activeTab === 'CREATE' && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
               <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl mr-4">⚠️</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Report an Issue</h3>
                    <p className="text-gray-500 text-sm">Dispute an unauthorized or incorrect transaction.</p>
                  </div>
               </div>

               <form onSubmit={handleCreateDispute} className="space-y-6">
                 {/* Account Selection */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Select Account</label>
                   <select 
                     value={selectedAccount}
                     onChange={e => setSelectedAccount(e.target.value)}
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                   >
                     {accounts.map(acc => (
                       <option key={acc.accountNumber} value={acc.accountNumber}>
                         {acc.accountType} - ****{String(acc.accountNumber).slice(-4)}
                       </option>
                     ))}
                   </select>
                 </div>

                 {/* Transaction Selection */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Select Transaction</label>
                   {isFetchingTxs ? (
                     <div className="animate-pulse bg-gray-100 h-12 rounded-xl w-full"></div>
                   ) : (
                     <select 
                       value={newDisputeData.transactionId}
                       onChange={e => setNewDisputeData({...newDisputeData, transactionId: e.target.value})}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                       required
                     >
                       <option value="" disabled>-- Select a Recent Transaction --</option>
                       {transactions.slice(0, 15).map(tx => (
                         <option key={tx.transactionId} value={tx.transactionId}>
                           {new Date(tx.transactionDate).toLocaleDateString()} - {tx.transactionType === 'DEBIT' ? '-' : '+'}₹{tx.amount.toLocaleString()} ({tx.description})
                         </option>
                       ))}
                     </select>
                   )}
                 </div>

                 {/* Category & Priority Row */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Dispute Category</label>
                      <select 
                        value={newDisputeData.category}
                        onChange={e => setNewDisputeData({...newDisputeData, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                      >
                         <option value="UNAUTHORIZED">Unauthorized Transaction</option>
                         <option value="DUPLICATE">Duplicate Charge</option>
                         <option value="INCORRECT_AMOUNT">Incorrect Amount</option>
                         <option value="GOODS_NOT_RECEIVED">Goods/Services Not Received</option>
                         <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                      <select 
                        value={newDisputeData.priority}
                        onChange={e => setNewDisputeData({...newDisputeData, priority: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                      >
                         <option value="HIGH">High (Urgent)</option>
                         <option value="MEDIUM">Medium</option>
                         <option value="LOW">Low</option>
                      </select>
                    </div>
                 </div>

                 {/* Description */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                   <textarea
                     value={newDisputeData.description}
                     onChange={e => setNewDisputeData({...newDisputeData, description: e.target.value})}
                     required
                     rows={4}
                     placeholder="Please provide any additional details that might help us investigate this issue..."
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all resize-none"
                   ></textarea>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
                  </button>
               </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DisputeCenter;