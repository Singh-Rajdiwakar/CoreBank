import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { depositAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';
import FloatingLabelInput from '../../../components/forms/FloatingLabelInput';

const DepositsDashboard = () => {
  const { accounts, customer } = useStore();
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW', 'NEW_FD', 'NEW_RD'
  const [loading, setLoading] = useState(true);
  
  const [fds, setFDs] = useState([]);
  const [rds, setRDs] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fdModal, setFdModal] = useState({ show: false, fdId: null });

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const [fdRes, rdRes] = await Promise.all([
        depositAPI.getMyFDs(),
        depositAPI.getMyRDs()
      ]);
      setFDs(Array.isArray(fdRes.data) ? fdRes.data : (Array.isArray(fdRes.data?.data) ? fdRes.data.data : (fdRes.data?.data?.content || fdRes.data?.content || [])));
      setRDs(Array.isArray(rdRes.data) ? rdRes.data : (Array.isArray(rdRes.data?.data) ? rdRes.data.data : (rdRes.data?.data?.content || rdRes.data?.content || [])));
    } catch (err) {
      console.error('Failed to fetch deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleWithdrawFD = async () => {
    if (!fdModal.fdId) return;
    setIsSubmitting(true);
    try {
      await depositAPI.withdrawFD(fdModal.fdId);
      showNotification('FD withdrawn successfully!', 'success');
      setFdModal({ show: false, fdId: null });
      fetchDeposits();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to withdraw FD.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayRDInstallment = async (rdId) => {
    try {
      await depositAPI.payRDInstallment(rdId);
      showNotification('Installment paid successfully!', 'success');
      fetchDeposits();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to pay installment.', 'error');
    }
  };

  const totalInvestment = useMemo(() => {
    const fdTotal = fds.reduce((sum, fd) => sum + fd.principalAmount, 0);
    const rdTotal = rds.reduce((sum, rd) => sum + (rd.installmentAmount * rd.tenureMonths), 0); // approximation or use actual total if available
    return fdTotal + rdTotal;
  }, [fds, rds]);

  // FD Form
  const [fdForm, setFdForm] = useState({ principalAmount: '', tenureMonths: '12', interestRate: 6.5, fundingAccountNumber: accounts[0]?.accountNumber || '' });
  // RD Form
  const [rdForm, setRdForm] = useState({ installmentAmount: '', tenureMonths: '12', interestRate: 6.0, fundingAccountNumber: accounts[0]?.accountNumber || '' });

  const handleOpenFD = async (e) => {
    e.preventDefault();
    if (!fdForm.principalAmount || parseFloat(fdForm.principalAmount) <= 0) return showNotification('Enter valid principal amount', 'error');
    
    setIsSubmitting(true);
    try {
      await depositAPI.openFD({
         fundingAccountNumber: fdForm.fundingAccountNumber,
         principalAmount: parseFloat(fdForm.principalAmount),
         tenureMonths: parseInt(fdForm.tenureMonths, 10),
         interestRate: fdForm.interestRate
      });
      showNotification('Fixed Deposit created successfully!', 'success');
      setFdForm({ principalAmount: '', tenureMonths: '12', interestRate: 6.5, fundingAccountNumber: accounts[0]?.accountNumber || '' });
      setActiveTab('OVERVIEW');
      fetchDeposits();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Failed to open FD', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRD = async (e) => {
    e.preventDefault();
    if (!rdForm.installmentAmount || parseFloat(rdForm.installmentAmount) <= 0) return showNotification('Enter valid installment amount', 'error');
    
    setIsSubmitting(true);
    try {
      await depositAPI.openRD({
         fundingAccountNumber: rdForm.fundingAccountNumber,
         installmentAmount: parseFloat(rdForm.installmentAmount),
         tenureMonths: parseInt(rdForm.tenureMonths, 10),
         interestRate: rdForm.interestRate
      });
      showNotification('Recurring Deposit created successfully!', 'success');
      setRdForm({ installmentAmount: '', tenureMonths: '12', interestRate: 6.0, fundingAccountNumber: accounts[0]?.accountNumber || '' });
      setActiveTab('OVERVIEW');
      fetchDeposits();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Failed to open RD', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Deposits & Investments</h2>
          <p className="text-gray-500 mt-2">Grow your wealth with secure Fixed and Recurring deposits.</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-xl shadow-inner">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'NEW_FD', label: 'Open FD' },
            { id: 'NEW_RD', label: 'Open RD' }
          ].map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === tab.id ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
             >
                {activeTab === tab.id && (
                   <motion.div
                     layoutId="depositTabBubble"
                     className="absolute inset-0 bg-white rounded-lg border border-gray-200"
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                )}
                <span className="relative z-10">{tab.label}</span>
             </button>
          ))}
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
            {activeTab === 'OVERVIEW' && (
              <div>
                {loading ? (
                   <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
                ) : (
                   <div>
                      {/* Total Investment Card */}
                      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 shadow-xl text-white mb-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                        <div className="relative z-10">
                           <p className="text-indigo-200 font-medium tracking-wide uppercase text-sm mb-2">Total Wealth</p>
                           <h3 className="text-5xl lg:text-6xl font-extrabold tracking-tight">₹{Number(totalInvestment).toLocaleString()}</h3>
                           <p className="mt-4 text-indigo-200 flex items-center">
                             <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                             Secure investments growing safely
                           </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Fixed Deposits List */}
                         <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                               <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">FD</span>
                               Fixed Deposits
                            </h4>
                            {fds.length === 0 ? (
                               <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                                  <p className="text-gray-500">No active Fixed Deposits.</p>
                                  <button onClick={() => setActiveTab('NEW_FD')} className="mt-4 text-indigo-600 font-semibold hover:text-indigo-800">Open one now &rarr;</button>
                               </div>
                            ) : (
                               <div className="space-y-4">
                                  {fds.map(fd => (
                                     <motion.div whileHover={{ y: -2 }} key={fd.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                           <div>
                                              <p className="text-2xl font-bold text-gray-900">₹{Number(fd.principalAmount).toLocaleString()}</p>
                                              <p className="text-sm font-medium text-indigo-600">{fd.interestRate}% P.A.</p>
                                           </div>
                                           <div className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${fd.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                             {fd.status || 'ACTIVE'}
                                           </div>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
                                           <div>
                                             <span className="block mb-1">Tenure: {fd.tenureMonths} mo.</span>
                                             <span>Maturing: {fd.maturityDate ? new Date(fd.maturityDate).toLocaleDateString() : 'N/A'}</span>
                                           </div>
                                           {(!fd.status || fd.status === 'ACTIVE') && (
                                             <button 
                                               onClick={() => setFdModal({ show: true, fdId: fd.id || fd.fdId || fd.accountNumber })}
                                               className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors border border-red-100"
                                             >
                                               Withdraw
                                             </button>
                                           )}
                                        </div>
                                     </motion.div>
                                  ))}
                               </div>
                            )}
                         </div>

                         {/* Recurring Deposits List */}
                         <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                               <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">RD</span>
                               Recurring Deposits
                            </h4>
                            {rds.length === 0 ? (
                               <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                                  <p className="text-gray-500">No active Recurring Deposits.</p>
                                  <button onClick={() => setActiveTab('NEW_RD')} className="mt-4 text-purple-600 font-semibold hover:text-purple-800">Start saving &rarr;</button>
                               </div>
                            ) : (
                               <div className="space-y-4">
                                  {rds.map(rd => (
                                     <motion.div whileHover={{ y: -2 }} key={rd.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                           <div>
                                              <p className="text-2xl font-bold text-gray-900">₹{Number(rd.installmentAmount).toLocaleString()} <span className="text-sm font-medium text-gray-400">/mo</span></p>
                                              <p className="text-sm font-medium text-purple-600">{rd.interestRate}% P.A.</p>
                                           </div>
                                           <div className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${rd.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                             {rd.status || 'ACTIVE'}
                                           </div>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
                                           <div>
                                             <span className="block mb-1">{rd.tenureMonths} Installments</span>
                                             <span>Maturing: {rd.maturityDate ? new Date(rd.maturityDate).toLocaleDateString() : 'N/A'}</span>
                                           </div>
                                           {(!rd.status || rd.status === 'ACTIVE') && (
                                             <button 
                                               onClick={() => handlePayRDInstallment(rd.id || rd.rdId || rd.accountNumber)}
                                               className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-colors border border-purple-100"
                                             >
                                               Pay Installment
                                             </button>
                                           )}
                                        </div>
                                     </motion.div>
                                  ))}
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}
              </div>
            )}

            {activeTab === 'NEW_FD' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
                <div className="flex items-center mb-8">
                   <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl mr-4">🔒</div>
                   <div>
                     <h3 className="text-2xl font-bold text-gray-900">Open Fixed Deposit</h3>
                     <p className="text-gray-500 text-sm">Lock in your funds for a higher return.</p>
                   </div>
                </div>

                <form onSubmit={handleOpenFD} className="space-y-6">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Funding Account</label>
                     <select 
                       value={fdForm.fundingAccountNumber}
                       onChange={e => setFdForm({...fdForm, fundingAccountNumber: e.target.value})}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none focus:bg-white transition-all"
                     >
                       {accounts.map(acc => (
                         <option key={acc.accountNumber} value={acc.accountNumber}>
                           {acc.accountType} - ****{String(acc.accountNumber).slice(-4)} (Bal: ₹{acc.balance.toLocaleString()})
                         </option>
                       ))}
                     </select>
                   </div>

                   <FloatingLabelInput
                     label="Principal Amount (₹)"
                     name="principalAmount"
                     type="number"
                     value={fdForm.principalAmount}
                     onChange={(e) => setFdForm({...fdForm, principalAmount: e.target.value})}
                     placeholder="e.g. 100000"
                   />

                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Tenure (Months)</label>
                     <div className="flex items-center space-x-4">
                       <input 
                         type="range" min="3" max="120" step="3"
                         value={fdForm.tenureMonths}
                         onChange={(e) => {
                            const val = e.target.value;
                            let rate = 5.5;
                            if (val >= 12) rate = 6.5;
                            if (val >= 36) rate = 7.0;
                            setFdForm({...fdForm, tenureMonths: val, interestRate: rate});
                         }}
                         className="flex-1 accent-indigo-600"
                       />
                       <span className="w-24 text-center py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg">{fdForm.tenureMonths} mos</span>
                     </div>
                   </div>

                   <div className="bg-indigo-50/50 rounded-xl p-4 flex justify-between items-center border border-indigo-100">
                      <span className="text-gray-600 font-medium">Expected Interest Rate</span>
                      <span className="text-2xl font-extrabold text-indigo-700">{fdForm.interestRate}%</span>
                   </div>

                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                   >
                     {isSubmitting ? 'Processing...' : 'Create Fixed Deposit'}
                   </button>
                </form>
              </div>
            )}

            {activeTab === 'NEW_RD' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
                <div className="flex items-center mb-8">
                   <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl mr-4">🔄</div>
                   <div>
                     <h3 className="text-2xl font-bold text-gray-900">Open Recurring Deposit</h3>
                     <p className="text-gray-500 text-sm">Save systematically every month.</p>
                   </div>
                </div>

                <form onSubmit={handleOpenRD} className="space-y-6">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Funding Account (Monthly Auto-Debit)</label>
                     <select 
                       value={rdForm.fundingAccountNumber}
                       onChange={e => setRdForm({...rdForm, fundingAccountNumber: e.target.value})}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none focus:bg-white transition-all"
                     >
                       {accounts.map(acc => (
                         <option key={acc.accountNumber} value={acc.accountNumber}>
                           {acc.accountType} - ****{String(acc.accountNumber).slice(-4)} (Bal: ₹{acc.balance.toLocaleString()})
                         </option>
                       ))}
                     </select>
                   </div>

                   <FloatingLabelInput
                     label="Monthly Installment (₹)"
                     name="installmentAmount"
                     type="number"
                     value={rdForm.installmentAmount}
                     onChange={(e) => setRdForm({...rdForm, installmentAmount: e.target.value})}
                     placeholder="e.g. 5000"
                   />

                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Tenure (Months)</label>
                     <div className="flex items-center space-x-4">
                       <input 
                         type="range" min="6" max="60" step="6"
                         value={rdForm.tenureMonths}
                         onChange={(e) => {
                            const val = e.target.value;
                            let rate = 5.0;
                            if (val >= 12) rate = 6.0;
                            if (val >= 36) rate = 6.5;
                            setRdForm({...rdForm, tenureMonths: val, interestRate: rate});
                         }}
                         className="flex-1 accent-purple-600"
                       />
                       <span className="w-24 text-center py-2 bg-purple-50 text-purple-700 font-bold rounded-lg">{rdForm.tenureMonths} mos</span>
                     </div>
                   </div>

                   <div className="bg-purple-50/50 rounded-xl p-4 flex justify-between items-center border border-purple-100">
                      <span className="text-gray-600 font-medium">Expected Interest Rate</span>
                      <span className="text-2xl font-extrabold text-purple-700">{rdForm.interestRate}%</span>
                   </div>

                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all disabled:opacity-50"
                   >
                     {isSubmitting ? 'Processing...' : 'Create Recurring Deposit'}
                   </button>
                </form>
              </div>
            )}
         </motion.div>
      </AnimatePresence>

      {/* FD Withdrawal Modal */}
      <AnimatePresence>
        {fdModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 bg-red-50/50 border-b border-red-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900">Premature Withdrawal</h3>
                  <p className="text-sm text-red-700/80 mt-1">
                    Are you sure you want to break this Fixed Deposit? Premature withdrawals will incur a penalty and reduced interest earnings.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  disabled={isSubmitting}
                  onClick={() => setFdModal({ show: false, fdId: null })}
                  className="px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={handleWithdrawFD}
                  className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-red-200 flex items-center"
                >
                  {isSubmitting ? <span className="animate-spin text-sm mr-2">⏳</span> : null}
                  Confirm Withrawal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DepositsDashboard;
