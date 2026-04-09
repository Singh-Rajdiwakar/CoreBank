import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { beneficiaryAPI, transferAPI, customerAPI, accountAPI } from '../../../services/api';
import FloatingLabelInput from '../../../components/forms/FloatingLabelInput';
import Toast from '../../../components/common/Toast';
import TransactionPinModal from '../../../components/customer/TransactionPinModal';

const FundTransfer = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showPinModal, setShowPinModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const transferModes = ['INTERNAL', 'UPI', 'IMPS', 'NEFT', 'RTGS', 'SCHEDULED', 'RECURRING'];
  const [transferMode, setTransferMode] = useState('INTERNAL');

  const [formData, setFormData] = useState({
    destinationAccountNumber: '',
    upiId: '',
    amount: '',
    remarks: '',
    scheduledDate: '',
    startDate: '',
    endDate: '',
    frequency: 'MONTHLY'
  });

  const { customer, primaryAccount, accounts, setAccounts, setPrimaryAccount } = useStore();
  const [selectedSourceAccount, setSelectedSourceAccount] = useState('');

  // Fetch beneficiaries on mount
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const res = await beneficiaryAPI.getBeneficiaries();
        const data = res.data?.data || res.data || [];
        setBeneficiaries(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (data?.data?.content || data?.content || [])));
      } catch (error) {
        console.error('Failed to fetch beneficiaries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBeneficiaries();
  }, []);

  // Pre-select primary account if available
  useEffect(() => {
    if (primaryAccount && !selectedSourceAccount) {
      setSelectedSourceAccount(primaryAccount.accountNumber);
    }
  }, [primaryAccount, selectedSourceAccount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBeneficiarySelect = (accNumber) => {
    setFormData((prev) => ({ ...prev, destinationAccountNumber: String(accNumber) }));
  };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (transferMode === 'UPI' && !formData.upiId) {
      return showNotification('Please enter a UPI ID', 'error');
    }
    if (transferMode !== 'UPI' && !formData.destinationAccountNumber) {
       return showNotification('Please enter a destination account number', 'error');
    }
    if (!formData.amount) {
      return showNotification('Please enter an amount', 'error');
    }
    if (!selectedSourceAccount) {
      showNotification('Source account not selected', 'error');
      return;
    }
    
    if (transferMode === 'SCHEDULED' && !formData.scheduledDate) {
       return showNotification('Please select a scheduled date', 'error');
    }

    if (transferMode === 'RECURRING' && (!formData.startDate || !formData.endDate)) {
       return showNotification('Please select start and end dates', 'error');
    }
    
    // Check balance
    const account = accounts.find(act => String(act.accountNumber) === String(selectedSourceAccount));
    if (account && parseFloat(formData.amount) > account.balance && transferMode !== 'SCHEDULED' && transferMode !== 'RECURRING') {
      showNotification('Insufficient balance', 'error');
      return;
    }

    setShowPinModal(true);
  };

  const handlePinSubmit = async (pin) => {
    setShowPinModal(false);
    setIsTransferring(true);
    
    try {
      let res;
      if (transferMode === 'UPI') {
          res = await transferAPI.upiTransfer({
             sourceAccountNumber: selectedSourceAccount,
             upiId: formData.upiId,
             amount: parseFloat(formData.amount),
             remarks: formData.remarks || 'UPI Transfer',
             transactionPin: pin,
          });
      } else if (transferMode === 'SCHEDULED') {
          res = await transferAPI.scheduledTransfer({
             sourceAccountNumber: selectedSourceAccount,
             destinationAccountNumber: formData.destinationAccountNumber,
             amount: parseFloat(formData.amount),
             scheduledDate: formData.scheduledDate,
             remarks: formData.remarks || 'Scheduled Transfer',
             transactionPin: pin,
          });
      } else if (transferMode === 'RECURRING') {
          res = await transferAPI.recurringTransfer({
             sourceAccountNumber: selectedSourceAccount,
             destinationAccountNumber: formData.destinationAccountNumber,
             amount: parseFloat(formData.amount),
             startDate: formData.startDate,
             endDate: formData.endDate,
             frequency: formData.frequency,
             remarks: formData.remarks || 'Recurring Transfer',
             transactionPin: pin,
          });
      } else {
         const payload = {
            sourceAccountNumber: selectedSourceAccount,
            destinationAccountNumber: formData.destinationAccountNumber,
            amount: parseFloat(formData.amount),
            remarks: formData.remarks || `${transferMode} Transfer`,
            transactionPin: pin,
          };
          if (transferMode === 'INTERNAL') res = await transferAPI.internalTransfer(payload);
          else if (transferMode === 'IMPS') res = await transferAPI.impsTransfer(payload);
          else if (transferMode === 'NEFT') res = await transferAPI.neftTransfer(payload);
          else if (transferMode === 'RTGS') res = await transferAPI.rtgsTransfer(payload);
      }
      
      showNotification('Transfer successful!', 'success');
      setFormData({ 
        destinationAccountNumber: '', upiId: '', amount: '', remarks: '', 
        scheduledDate: '', startDate: '', endDate: '', frequency: 'MONTHLY' 
      });
      
      // Refresh balance
      refreshAccounts();
    } catch (error) {
      console.error('Transfer failed:', error);
      const errMsg = error.response?.data?.message || 'Transfer failed. Please try again.';
      showNotification(errMsg, 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const refreshAccounts = async () => {
    try {
      const customerId = customer?.id || customer?.customerId;
      if (customerId) {
        const accountsRes = await accountAPI.getAccountsByCustomer(customerId);
        const accountsData = Array.isArray(accountsRes.data) ? accountsRes.data : (Array.isArray(accountsRes.data?.data) ? accountsRes.data.data : (accountsRes.data?.data?.content || accountsRes.data?.content || []));
        setAccounts(accountsData);
        // If primary account was used, update it explicitly (zustand will do it if we map accounts but let's be safe)
        if (accountsData.length > 0) {
           const updatedPrimary = accountsData.find(a => String(a.accountNumber) === String(primaryAccount?.accountNumber)) || accountsData[0];
           setPrimaryAccount(updatedPrimary);
        }
      }
    } catch (err) {
      console.error("Failed to refresh accounts:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fund Transfer</h2>

        {/* Transfer Mode Segmented Control */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 overflow-x-auto scrollbar-hide space-x-1 border border-gray-200">
          {transferModes.map(mode => (
             <button
               key={mode}
               type="button"
               onClick={() => setTransferMode(mode)}
               className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                 transferMode === mode ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
               }`}
             >
                {transferMode === mode && (
                  <motion.div layoutId="transferModeBubble" className="absolute inset-0 bg-white rounded-lg border border-gray-200" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">{mode}</span>
             </button>
          ))}
        </div>

        {/* Source Account Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">From Account</label>
          <select 
            value={selectedSourceAccount}
            onChange={(e) => setSelectedSourceAccount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 bg-gray-50"
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountType} - ****{String(acc.accountNumber).slice(-4)} (Bal: ₹{acc.balance.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Beneficiaries Horoscope/Scrolling list */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Saved Payees</label>
          </div>
          
          {loading ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 w-32 h-20 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : beneficiaries.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {beneficiaries.map((b) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={b.id}
                  onClick={() => handleBeneficiarySelect(b.accountNumber)}
                  className={`flex-shrink-0 cursor-pointer w-40 p-4 border rounded-xl flex flex-col items-center justify-center transition-colors ${
                    String(formData.destinationAccountNumber) === String(b.accountNumber) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-2">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate w-full text-center">{b.name}</p>
                  <p className="text-xs text-gray-500 truncate w-full text-center">****{String(b.accountNumber).slice(-4)}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-4 border border-dashed border-gray-300 rounded-lg text-center">
              No saved payees found. Enter account number manually below.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {transferMode === 'UPI' ? (
              <FloatingLabelInput
                id="upiId"
                name="upiId"
                label="Recipient UPI ID"
                placeholder="e.g. name@bank"
                value={formData.upiId}
                onChange={handleInputChange}
              />
            ) : (
              <FloatingLabelInput
                id="destinationAccountNumber"
                name="destinationAccountNumber"
                label="Recipient Account Number"
                placeholder="Enter Account Number"
                value={formData.destinationAccountNumber}
                onChange={handleInputChange}
              />
            )}

            <FloatingLabelInput
              id="amount"
              name="amount"
              type="number"
              label="Amount (₹)"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleInputChange}
            />

            {transferMode === 'SCHEDULED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:outline-none"
                />
              </div>
            )}

            {transferMode === 'RECURRING' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select 
                    name="frequency" 
                    value={formData.frequency} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
            )}
            
            <FloatingLabelInput
              id="remarks"
              name="remarks"
              label="Remarks (Optional)"
              placeholder="What's this for?"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isTransferring}
            className={`w-full mt-8 py-3 rounded-lg text-white font-medium shadow-md transition-colors ${
              isTransferring ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isTransferring ? 'Processing...' : `Send Money via ${transferMode}`}
          </motion.button>
        </form>
      </motion.div>

      {/* Transaction Pin Modal */}
      <AnimatePresence>
        {showPinModal && (
          <TransactionPinModal 
            onClose={() => setShowPinModal(false)}
            onSubmit={handlePinSubmit}
            amount={formData.amount}
            recipient={
              transferMode === 'UPI' 
                ? formData.upiId 
                : beneficiaries.find(b => String(b.accountNumber) === String(formData.destinationAccountNumber))?.name || formData.destinationAccountNumber
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FundTransfer;
