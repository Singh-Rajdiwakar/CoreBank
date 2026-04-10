import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, FileText, CheckCircle, RefreshCw, Archive, ArrowRight, Activity, HelpCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { employeeAPI } from '../../../services/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const EmployeeTeller = () => {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(null);

  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    mode: 'CASH',
    chequeNumber: '',
    depositSlipReference: '',
    remarks: ''
  });

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = async () => {
    setLoading(true);
    try {
      // Endpoint could be /deposits/pending or /deposits?status=PENDING
      const res = await employeeAPI.getPendingDeposits();
      setPendingDeposits(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.content || res.data?.content || [])));
    } catch (err) {
      console.error('Error fetching pending deposits:', err);
      // For development resilience if endpoint is different
      if (err.response?.status === 404) {
        setPendingDeposits([]);
      } else {
        toast.error('Failed to load pending deposits. ' + (err.response?.data?.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.mode === 'CHEQUE' && !formData.chequeNumber.trim()) {
      toast.error('Cheque number is required for cheque deposits');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        chequeNumber: formData.mode === 'CASH' ? null : formData.chequeNumber
      };
      await employeeAPI.createDeposit(payload);
      toast.success('Deposit logged successfully');
      setFormData({
        accountNumber: '',
        amount: '',
        mode: 'CASH',
        chequeNumber: '',
        depositSlipReference: '',
        remarks: ''
      });
      fetchPendingDeposits();
    } catch (err) {
      console.error('Error submitting deposit:', err);
      toast.error('Failed to log deposit: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async (reference) => {
    if (!window.confirm('Are you sure you want to clear and approve this deposit? This action cannot be undone.')) {
      return;
    }

    setClearing(reference);
    try {
      await employeeAPI.clearDeposit(reference);
      toast.success('Deposit cleared successfully');
      fetchPendingDeposits();
    } catch (err) {
      console.error('Error clearing deposit:', err);
      toast.error('Failed to clear deposit: ' + (err.response?.data?.message || err.message));
    } finally {
      setClearing(null);
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teller & Deposit Desk</h1>
          <p className="text-gray-500 text-sm mt-1">Process cash and cheque deposits, and clear pending transactions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: New Deposit Form */}
          <div className="lg:col-span-4 bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden h-fit">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-800">New Deposit</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="accountNumber"
                    required
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="pl-10 w-full min-h-[42px] border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    placeholder="ACC-XXXXX"
                  />
                  <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="pl-8 w-full min-h-[42px] border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-medium text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Mode</label>
                <div className="flex space-x-4">
                  <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.mode === 'CASH' ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="mode"
                      value="CASH"
                      checked={formData.mode === 'CASH'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className={`text-sm font-bold ${formData.mode === 'CASH' ? 'text-indigo-700' : 'text-gray-600'}`}>CASH</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.mode === 'CHEQUE' ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="mode"
                      value="CHEQUE"
                      checked={formData.mode === 'CHEQUE'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className={`text-sm font-bold ${formData.mode === 'CHEQUE' ? 'text-indigo-700' : 'text-gray-600'}`}>CHEQUE</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Cheque Number Field */}
              <AnimatePresence>
                {formData.mode === 'CHEQUE' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
                    <input
                      type="text"
                      name="chequeNumber"
                      required={formData.mode === 'CHEQUE'}
                      value={formData.chequeNumber}
                      onChange={handleInputChange}
                      className="w-full min-h-[42px] border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-yellow-50"
                      placeholder="e.g. 000123456"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  Deposit Slip Reference
                  <HelpCircle className="w-4 h-4 text-gray-400" title="Physical slip tracking number" />
                </label>
                <input
                  type="text"
                  name="depositSlipReference"
                  required
                  value={formData.depositSlipReference}
                  onChange={handleInputChange}
                  className="w-full min-h-[42px] border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder="SLIP-XXX-YYY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teller Remarks</label>
                <textarea
                  name="remarks"
                  rows="2"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                  placeholder="Optional notes..."
                ></textarea>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white font-bold tracking-wide uppercase text-sm py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Submit Fast Entry</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Pending Clearances */}
          <div className="lg:col-span-8 bg-white shadow-sm border border-gray-200 rounded-xl flex flex-col h-[700px]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Archive className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-800">Pending Clearances</h2>
              </div>
              <button 
                onClick={fetchPendingDeposits} 
                disabled={loading}
                className="text-gray-500 hover:text-indigo-600 transition-colors focus:outline-none"
                title="Refresh list"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
              {loading && pendingDeposits.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                </div>
              ) : pendingDeposits.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-300 mb-3" />
                  <p className="font-medium text-gray-600">All caught up!</p>
                  <p className="text-sm">No pending deposits waiting for clearance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingDeposits.map(deposit => (
                    <motion.div 
                      key={deposit.reference || deposit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border text-left border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
                    >
                      <div className="md:col-span-1">
                        <div className="text-sm font-bold text-gray-900">₹${deposit.amount?.toFixed(2)}</div>
                        <div className={`mt-1 text-[10px] font-bold inline-block px-1.5 py-0.5 rounded-sm ${
                          deposit.mode === 'CASH' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {deposit.mode}
                        </div>
                      </div>

                      <div className="md:col-span-2 text-sm text-gray-600 space-y-1">
                        <div><span className="font-medium text-gray-800">Acc:</span> <span className="font-mono">{deposit.accountNumber}</span></div>
                        {deposit.mode === 'CHEQUE' && (
                          <div><span className="font-medium text-gray-800">Cheque #:</span> <span className="font-mono">{deposit.chequeNumber}</span></div>
                        )}
                        <div className="text-xs text-gray-400 font-mono">Ref: {deposit.reference || deposit.depositSlipReference}</div>
                        <div className="text-xs text-gray-400">Received: {deposit.createdAt ? new Date(deposit.createdAt).toLocaleString() : 'Just now'}</div>
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <button
                          onClick={() => handleClear(deposit.reference || deposit.id)}
                          disabled={clearing === (deposit.reference || deposit.id)}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors disabled:opacity-50 text-sm font-bold"
                        >
                          {clearing === (deposit.reference || deposit.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>Clear Deposit</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeTeller;



