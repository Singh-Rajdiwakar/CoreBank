import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { managerAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const mockLoans = [
  {
    id: 101,
    customerId: 'CUST-001',
    loanType: 'HOME_LOAN',
    principalAmount: 250000,
    requestedInterestRate: 6.5,
    tenureMonths: 240,
    status: 'PENDING_APPROVAL',
    purpose: 'Buying a new apartment in midtown.'
  },
  {
    id: 102,
    customerId: 'CUST-089',
    loanType: 'PERSONAL_LOAN',
    principalAmount: 15000,
    requestedInterestRate: 10.0,
    tenureMonths: 36,
    status: 'PENDING_APPROVAL',
    purpose: 'Medical emergency.'
  },
  {
    id: 103,
    customerId: 'CUST-042',
    loanType: 'AUTO_LOAN',
    principalAmount: 35000,
    requestedInterestRate: 7.2,
    tenureMonths: 60,
    status: 'APPROVED', 
    purpose: 'Used vehicle purchase.'
  }
];

const ManagerLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Modals state
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [isForecloseModalOpen, setIsForecloseModalOpen] = useState(false);
  const [forecloseRemarks, setForecloseRemarks] = useState('');
  const [forecloseConfirmText, setForecloseConfirmText] = useState('');

  // Review Form state
  const [reviewData, setReviewData] = useState({
    approve: true,
    annualInterestRate: '',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    // Mocking the GET fallback since no strict MANAGER getAll pending exists.
    setTimeout(() => {
      setLoans(mockLoans);
      setLoading(false);
    }, 500);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleOpenReview = (loan) => {
    setSelectedLoan(loan);
    setReviewData({
      approve: true,
      annualInterestRate: loan.requestedInterestRate || '',
      remarks: ''
    });
    setIsReviewModalOpen(true);
  };

  const handleOpenDisburse = (loan) => {
    setSelectedLoan(loan);
    setIsDisburseModalOpen(true);
  };

  const handleOpenForeclose = (loan) => {
    setSelectedLoan(loan);
    setForecloseRemarks('');
    setForecloseConfirmText('');
    setIsForecloseModalOpen(true);
  };

  const submitForeclose = async (e) => {
    e.preventDefault();
    if (forecloseConfirmText !== 'CONFIRM') {
      showToast('Type CONFIRM exactly to proceed', 'error');
      return;
    }
    if (!forecloseRemarks) {
      showToast('Remarks are required for foreclosure', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await managerAPI.forecloseLoan(selectedLoan.id, forecloseRemarks);
      setLoans(prev => prev.map(l => l.id === selectedLoan.id ? { ...l, status: 'FORECLOSED' } : l));
      showToast('Loan successfully foreclosed.', 'success');
      setIsForecloseModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to foreclose loan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (reviewData.approve && !reviewData.annualInterestRate) {
      showToast('Interest rate is mandatory for approval', 'error');
      return;
    }
    if (!reviewData.remarks.trim()) {
      showToast('Remarks are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        approve: reviewData.approve === true || reviewData.approve === 'true',
        annualInterestRate: parseFloat(reviewData.annualInterestRate),
        remarks: reviewData.remarks
      };
      
      // Real API Call
      await managerAPI.reviewLoan(selectedLoan.id, payload);
      
      // Optimistic Update
      setLoans(prev => prev.map(l => l.id === selectedLoan.id ? { ...l, status: payload.approve ? 'APPROVED' : 'REJECTED' } : l));
      
      showToast(`Loan ${payload.approve ? 'Approved' : 'Rejected'} successfully.`);
      setIsReviewModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to review loan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisburse = async () => {
    setSubmitting(true);
    try {
      await managerAPI.disburseLoan(selectedLoan.id);
      
      // Optimistic Update
      setLoans(prev => prev.map(l => l.id === selectedLoan.id ? { ...l, status: 'DISBURSED' } : l));
      
      showToast('Loan funds disbursed successfully.');
      setIsDisburseModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to disburse loan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loan Processing Engine</h1>
        <p className="text-gray-500 mt-1">Review incoming applications, assign interest rates, and disburse capital.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loan ID / Customer</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Term</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Principal</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {loading ? (
                 <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading incoming applications...</td></tr>
               ) : loans.length === 0 ? (
                 <tr><td colSpan="5" className="text-center py-10 text-gray-500">No applications found in your queue.</td></tr>
               ) : (
                 loans.map(loan => (
                   <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                       <span className="block text-sm font-bold text-gray-900">#{loan.id}</span>
                       <span className="block text-xs text-gray-500 font-mono mt-0.5">{loan.customerId}</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="block text-sm font-medium text-gray-800">{loan.loanType.replace('_', ' ')}</span>
                       <span className="block text-xs text-gray-500 mt-0.5">{loan.tenureMonths} Months</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="block text-sm font-bold text-green-600">{formatCurrency(loan.principalAmount)}</span>
                       <span className="block text-xs text-gray-500 mt-0.5">Req. Rate: {loan.requestedInterestRate}%</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md
                         ${loan.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                           loan.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                           loan.status === 'DISBURSED' ? 'bg-green-100 text-green-800' :
                           'bg-red-100 text-red-800'}`}>
                         {loan.status.replace('_', ' ')}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right space-x-3">
                       {loan.status === 'PENDING_APPROVAL' && (
                         <button
                           onClick={() => handleOpenReview(loan)}
                           className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-bold transition-colors"
                         >
                           Review Application
                         </button>
                       )}
                       {loan.status === 'APPROVED' && (
                         <button
                           onClick={() => handleOpenDisburse(loan)}
                           className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold shadow-sm transition-colors"
                         >
                           Disburse Funds
                         </button>
                       )}
                         {(loan.status === 'ACTIVE' || loan.status === 'DISBURSED') && (
                           <button
                             onClick={() => handleOpenForeclose(loan)}
                             className="ml-2 inline-flex items-center px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-bold shadow-sm transition-colors"
                           >
                             Foreclose
                           </button>
                         )}
                         {(loan.status === 'FORECLOSED' || loan.status === 'REJECTED') && (
                         <span className="text-gray-400 text-sm font-medium italic">Action Completed</span>
                       )}
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900 border-b pb-3">Loan Review (App #{selectedLoan.id})</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Customer Stated Purpose</p>
                 <p className="text-sm text-gray-800 italic">"{selectedLoan.purpose}"</p>
              </div>

              <form onSubmit={submitReview} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Decision</label>
                  <select
                    value={reviewData.approve}
                    onChange={(e) => setReviewData({...reviewData, approve: e.target.value === 'true'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    <option value="true">Approve Loan</option>
                    <option value="false">Reject Loan</option>
                  </select>
                </div>

                {reviewData.approve && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sanctioned Annual Interest Rate (%) *</label>
                    <div className="flex items-center">
                       <input
                         type="number" step="0.01" min="0.1" required={reviewData.approve}
                         value={reviewData.annualInterestRate}
                         onChange={(e) => setReviewData({...reviewData, annualInterestRate: e.target.value})}
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-medium"
                         placeholder={`e.g. ${selectedLoan.requestedInterestRate}`}
                       />
                       <span className="ml-3 text-sm text-gray-500 font-medium bg-gray-100 px-3 py-2 rounded-md">Requested: {selectedLoan.requestedInterestRate}%</span>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Manager Remarks / Audit Note *</label>
                  <textarea
                    required rows="3"
                    value={reviewData.remarks}
                    onChange={(e) => setReviewData({...reviewData, remarks: e.target.value})}
                    placeholder="Provide reasoning for this rating/decision..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-medium resize-none shadow-sm"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className={`flex-1 py-2.5 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 ${reviewData.approve ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {submitting ? 'Processing...' : 'Submit Decision'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disburse Modal */}
      <AnimatePresence>
        {isDisburseModalOpen && selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Authorize Capital Disbursement</h3>
              <p className="text-gray-600 text-sm mb-6">
                You are about to release <strong className="text-green-700">{formatCurrency(selectedLoan.principalAmount)}</strong> to Customer <strong className="font-mono">{selectedLoan.customerId}</strong>. This financial action cannot be undone. 
              </p>
              
              <div className="flex gap-4">
                  <button type="button" onClick={() => setIsDisburseModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
                    Abort
                  </button>
                  <button onClick={submitDisburse} disabled={submitting} className="flex-1 py-3 text-white bg-green-600 hover:bg-green-700 font-bold rounded-lg shadow-md disabled:opacity-50">
                    {submitting ? 'Executing...' : 'Confirm Disburse'}
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Foreclose Modal */}
      <AnimatePresence>
        {isForecloseModalOpen && selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border-4 border-red-500 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500"></div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-2 border-2 border-red-500">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-700 uppercase tracking-wide">Danger Zone: Foreclose Loan</h3>
              <p className="text-gray-600 text-sm mb-6 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                You are initiating a highly destructive foreclosure action on Loan <strong className="font-mono text-gray-900">#{selectedLoan.id}</strong> for <strong className="font-mono text-gray-900">{selectedLoan.customerId}</strong>.
              </p>
              
              <div className="text-left mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mandatory Remarks <span className="text-red-500">*</span></label>
                  <textarea 
                    value={forecloseRemarks}
                    onChange={(e) => setForecloseRemarks(e.target.value)}
                    placeholder="Provide justification for foreclosure..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm h-24 resize-none"
                    required
                  ></textarea>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Type CONFIRM to proceed <span className="text-red-500">*</span></label>
                   <input 
                      type="text" 
                      value={forecloseConfirmText}
                      onChange={(e) => setForecloseConfirmText(e.target.value)}
                      placeholder="CONFIRM"
                      className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-center font-bold tracking-widest uppercase bg-red-50 text-red-900 placeholder-red-300"
                   />
                </div>
              </div>

              <div className="flex gap-4">
                  <button type="button" onClick={() => setIsForecloseModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Abort</button>
                  <button 
                     type="button" 
                     onClick={submitForeclose}
                     disabled={forecloseConfirmText !== 'CONFIRM' || !forecloseRemarks.trim()}
                     className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-red-200"
                  >
                     Execute Foreclosure
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManagerLoans;