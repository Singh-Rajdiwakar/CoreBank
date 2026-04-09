import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { loanAPI } from '../../../services/api';
import FloatingLabelInput from '../../../components/forms/FloatingLabelInput';
import Toast from '../../../components/common/Toast';

// EMI Schedule Modal
const EMIScheduleModal = ({ loan, onClose, onPayEmi }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingEmiId, setProcessingEmiId] = useState(null);
  
  const { primaryAccount } = useStore();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await loanAPI.getEmiSchedule(loan.id);
        const data = res.data?.data || res.data || [];
        setSchedule(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (data?.data?.content || data?.content || [])));
      } catch (err) {
        console.error('Failed to fetch EMI schedule', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [loan.id]);

  const handlePay = async (emi) => {
    if (!primaryAccount) return alert('No primary account available to pay from.');
    setProcessingEmiId(emi.id);
    try {
      await onPayEmi(emi.id, primaryAccount.accountNumber);
      // Update local state to reflect paid status
      setSchedule(prev => prev.map(item => item.id === emi.id ? { ...item, status: 'PAID' } : item));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingEmiId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">EMI Schedule</h3>
            <p className="text-sm text-gray-500">Loan ID: {loan.id} • {loan.loanType}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
             <div className="flex justify-center items-center py-12">
               <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
             </div>
          ) : schedule.length === 0 ? (
             <p className="text-center text-gray-500">No EMI schedule found.</p>
          ) : (
            <div className="space-y-4">
              {schedule.map((emi, idx) => {
                const isPaid = emi.status === 'PAID';
                return (
                  <div key={emi.id || idx} className={`flex items-center justify-between p-4 rounded-xl border ${isPaid ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div>
                      <p className="font-semibold text-gray-900">₹{Number(emi.emiAmount).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Due: {new Date(emi.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {isPaid ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">PAID</span>
                      ) : (
                        <button 
                          onClick={() => handlePay(emi)}
                          disabled={processingEmiId === emi.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processingEmiId === emi.id ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Wizard Step Component
const ApplyLoanWizard = ({ onApply, isApplying }) => {
  const [step, setStep] = useState(1);
  const { accounts } = useStore();
  
  const [formData, setFormData] = useState({
    loanType: 'PERSONAL',
    principalAmount: '',
    tenureMonths: '12',
    disbursementAccountNumber: accounts[0]?.accountNumber || ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);
  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(formData);
  };

  const steps = [
    { label: 'Loan Type', icon: '📝' },
    { label: 'Amount & Tenure', icon: '💰' },
    { label: 'Disbursement', icon: '🏦' },
    { label: 'Review', icon: '✅' }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600" 
            initial={{ width: 0 }} 
            animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} 
            transition={{ duration: 0.3 }}
          />
        </div>
        {steps.map((s, idx) => {
          const isActive = step >= idx + 1;
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                {s.icon}
              </div>
              <span className={`text-xs mt-2 font-medium absolute -bottom-6 w-32 text-center ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Wizard Content */}
      <form onSubmit={handleSubmit} className="mt-12 min-h-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What type of loan do you need?</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['PERSONAL', 'HOME', 'AUTO', 'EDUCATION'].map(type => (
                    <div 
                      key={type}
                      onClick={() => setFormData({...formData, loanType: type})}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.loanType === type ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <p className="font-semibold text-gray-900">{type.charAt(0) + type.slice(1).toLowerCase()} Loan</p>
                      <p className="text-xs text-gray-500 mt-1">Attractive interest rates</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">How much do you need?</h3>
                <FloatingLabelInput
                  label="Principal Amount (₹)"
                  name="principalAmount"
                  type="number"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({...formData, principalAmount: e.target.value})}
                  placeholder="e.g. 500000"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tenure (Months)</label>
                  <input 
                    type="range" min="6" max="120" step="6"
                    value={formData.tenureMonths}
                    onChange={(e) => setFormData({...formData, tenureMonths: e.target.value})}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
                    <span>6 Months</span>
                    <span className="text-blue-600 font-bold text-lg">{formData.tenureMonths} Months</span>
                    <span>120 Months</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Where should we send the money?</h3>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disbursement Account</label>
                <select
                  value={formData.disbursementAccountNumber}
                  onChange={(e) => setFormData({...formData, disbursementAccountNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountType} - ****{String(acc.accountNumber).slice(-4)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Review your application</h3>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loan Type</span>
                    <span className="font-semibold text-gray-900">{formData.loanType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Principal Amount</span>
                    <span className="font-semibold text-gray-900">₹{Number(formData.principalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tenure</span>
                    <span className="font-semibold text-gray-900">{formData.tenureMonths} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Disbursement A/C</span>
                    <span className="font-semibold text-gray-900">****{formData.disbursementAccountNumber.slice(-4)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">By clicking apply, you agree to our terms and conditions.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          {step > 1 ? (
             <button type="button" onClick={handlePrev} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Back</button>
          ) : <div></div>}
          
          {step < steps.length ? (
             <button 
                type="button" 
                onClick={handleNext} 
                disabled={step === 2 && !formData.principalAmount}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
             >
                Continue
             </button>
          ) : (
             <button 
                type="submit" 
                disabled={isApplying}
                className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 shadow-md shadow-green-200"
             >
                {isApplying ? 'Submitting...' : 'Apply Now'}
             </button>
          )}
        </div>
      </form>
    </div>
  );
};

const LoansDashboard = () => {
  const [activeTab, setActiveTab] = useState('MY_LOANS'); // 'MY_LOANS' or 'APPLY_LOAN'
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isApplying, setIsApplying] = useState(false);
  const [selectedLoanForEmi, setSelectedLoanForEmi] = useState(null);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await loanAPI.getMyLoans();
      const data = res.data?.data || res.data || [];
      setLoans(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (data?.data?.content || data?.content || [])));
    } catch (err) {
      console.error('Failed to fetch loans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleApplyLoan = async (formData) => {
    setIsApplying(true);
    try {
      const payload = {
        disbursementAccountNumber: formData.disbursementAccountNumber,
        loanType: formData.loanType,
        principalAmount: parseFloat(formData.principalAmount),
        tenureMonths: parseInt(formData.tenureMonths, 10)
      };
      await loanAPI.applyForLoan(payload);
      showNotification('Loan application submitted successfully!', 'success');
      setActiveTab('MY_LOANS');
      fetchLoans();
    } catch (err) {
      console.error('Loan application failed', err);
      showNotification(err.response?.data?.message || 'Failed to apply for loan', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handlePayEmi = async (emiId, accountId) => {
    try {
      await loanAPI.payEmi({
         emiId: emiId,
         sourceAccountNumber: accountId
      });
      showNotification('EMI Paid successfully!', 'success');
      // Refresh loans to update outstanding principal
      fetchLoans();
    } catch (err) {
      console.error('EMI payment failed', err);
      showNotification(err.response?.data?.message || 'Failed to pay EMI', 'error');
      throw err; // throw to be caught by modal to stop loading state
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loans Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your active loans and apply for new ones.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['MY_LOANS', 'APPLY_LOAN'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="loanTabBubble"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab === 'MY_LOANS' ? 'My Loans' : 'Apply for Loan'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {activeTab === 'MY_LOANS' ? (
          <div>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : loans.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏦</div>
                <h3 className="text-lg font-semibold text-gray-900">No active loans</h3>
                <p className="text-gray-500 mt-2 mb-6">You don't have any active loans with us yet.</p>
                <button onClick={() => setActiveTab('APPLY_LOAN')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  Apply Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loans.map(loan => {
                  const paidAmount = loan.principalAmount - (loan.outstandingPrincipal || loan.principalAmount);
                  const progressPct = Math.max(0, Math.min(100, (paidAmount / loan.principalAmount) * 100));
                  
                  return (
                    <motion.div 
                      key={loan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-3">
                            {loan.loanType} LOAN
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">₹{Number(loan.principalAmount).toLocaleString()}</h3>
                          <p className="text-sm text-gray-500 mt-1">Ref: {loan.id} • {loan.tenureMonths} Months</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${loan.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {loan.status}
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500 font-medium">Repayment Progress</span>
                          <span className="font-bold text-gray-900">{progressPct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-gray-500">
                          <span>Paid: ₹{Number(paidAmount).toLocaleString()}</span>
                          <span>Left: ₹{Number(loan.outstandingPrincipal || loan.principalAmount).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex gap-3">
                        <button 
                          onClick={() => setSelectedLoanForEmi(loan)}
                          className="flex-1 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          View EMI Schedule
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <ApplyLoanWizard onApply={handleApplyLoan} isApplying={isApplying} />
        )}
      </div>

      <AnimatePresence>
        {selectedLoanForEmi && (
          <EMIScheduleModal 
            loan={selectedLoanForEmi} 
            onClose={() => setSelectedLoanForEmi(null)} 
            onPayEmi={handlePayEmi}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default LoansDashboard;
