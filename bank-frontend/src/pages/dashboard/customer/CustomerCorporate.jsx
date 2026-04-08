import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, UploadCloud, Plus, Trash2, ShieldCheck, 
  RefreshCw, CheckCircle, XCircle, AlertTriangle, Play 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { transferAPI, accountAPI } from '../../../services/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';

const CustomerCorporate = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sourceAccountNumber: '',
    transactionPin: '',
    otp: '',
    remarks: 'Bulk Disbursement',
    type: 'FILE' // 'FILE' or 'SALARY'
  });

  const [items, setItems] = useState([
    { destinationAccountNumber: '', amount: '', remarks: '' }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Result Modal State
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await accountAPI.getAccountsByCustomer(user?.id);
      const accList = Array.isArray(res.data) ? res.data : [];
      setAccounts(accList);
      if (accList.length > 0) {
        setFormData(prev => ({ ...prev, sourceAccountNumber: accList[0].accountNumber }));
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { destinationAccountNumber: '', amount: '', remarks: '' }]);
  };

  const removeRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length ? newItems : [{ destinationAccountNumber: '', amount: '', remarks: '' }]);
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseCSV(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      const newItems = [];
      // Skip header row if present, assuming columns: DestinationAccount, Amount, Remarks
      const startIndex = lines[0].toLowerCase().includes('account') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 2) {
          newItems.push({
            destinationAccountNumber: parts[0],
            amount: parts[1],
            remarks: parts[2] || formData.remarks
          });
        }
      }

      if (newItems.length > 0) {
        setItems(newItems);
        toast.success(`Loaded ${newItems.length} rows from CSV`);
      } else {
        toast.error('Invalid CSV format. Please use: DestinationAccount,Amount,Remarks');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (items.length === 0 || !items[0].destinationAccountNumber || !items[0].amount) {
      toast.error('Please add at least one valid transfer row');
      return;
    }
    if (!formData.transactionPin || !formData.otp) {
      toast.error('Transaction PIN and OTP are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sourceAccountNumber: formData.sourceAccountNumber,
        transactionPin: formData.transactionPin,
        otp: formData.otp,
        remarks: formData.remarks,
        items: items.map(item => ({
          destinationAccountNumber: item.destinationAccountNumber,
          amount: Number(item.amount),
          remarks: item.remarks || formData.remarks
        }))
      };

      let res;
      if (formData.type === 'SALARY') {
        res = await transferAPI.bulkSalary(payload);
      } else {
        res = await transferAPI.bulkFile(payload);
      }
      
      setResultData(res.data);
      toast.success('Bulk transfer processed');
      
      // Reset sensitive fields
      setFormData(prev => ({ ...prev, transactionPin: '', otp: '' }));
    } catch (err) {
      console.error('Error processing bulk transfer:', err);
      toast.error('Failed to process bulk transfer: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const closeResultData = () => {
    setResultData(null);
    setItems([{ destinationAccountNumber: '', amount: '', remarks: '' }]);
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="w-6 h-6 mr-2 text-indigo-600" />
            Corporate Bulk Services
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload CSV files or manually process bulk salary disbursements in real-time.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Payload Entry */}
          <div className="lg:col-span-8 space-y-6">
            {/* Record Table / File Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Transfer List</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    TOTAL: ${items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center space-x-1 text-sm text-indigo-600 font-medium hover:text-indigo-800"
                  >
                    <Plus className="w-4 h-4" /> <span>Add Row</span>
                  </button>
                </div>
              </div>

              {/* Drag n Drop Upload Area */}
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv, application/vnd.ms-excel"
                    className="hidden"
                  />
                  <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium text-gray-700">Drag & drop CSV file, or <span className="text-indigo-600">browse</span></p>
                  <p className="text-xs text-gray-500 mt-1">Format: DestinationAccount, Amount, Remarks</p>
                </div>
              </div>

              {/* Dynamic Rows */}
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                      <th className="pb-3 w-10 text-center">#</th>
                      <th className="pb-3 px-2">Destination Account</th>
                      <th className="pb-3 px-2">Amount ($)</th>
                      <th className="pb-3 px-2">Remarks</th>
                      <th className="pb-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.tr 
                          key={index}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="py-3 text-center text-sm text-gray-500 font-mono">{index + 1}</td>
                          <td className="py-3 px-2">
                            <input 
                              type="text"
                              required
                              value={item.destinationAccountNumber}
                              onChange={(e) => handleItemChange(index, 'destinationAccountNumber', e.target.value)}
                              placeholder="Account Number"
                              className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input 
                              type="number"
                              required
                              min="0.01"
                              step="0.01"
                              value={item.amount}
                              onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                              placeholder="0.00"
                              className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input 
                              type="text"
                              value={item.remarks}
                              onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                              placeholder="Optional note"
                              className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Auth Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-800">Authorization</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="FILE">Standard Bulk (Vendors/General)</option>
                    <option value="SALARY">Salary Disbursement (Employees)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Account</label>
                  <select
                    name="sourceAccountNumber"
                    required
                    value={formData.sourceAccountNumber}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
                  >
                    <option value="" disabled>Select Source Account</option>
                    {accounts.map(acc => (
                      <option key={acc.accountNumber} value={acc.accountNumber}>
                        {acc.accountNumber} • ${Number(acc.balance || 0).toFixed(2)} ({acc.accountType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Global Default Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Applied if row remarks are empty.</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction PIN</label>
                  <input
                    type="password"
                    name="transactionPin"
                    required
                    maxLength="6"
                    value={formData.transactionPin}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center tracking-widest text-lg font-mono"
                    placeholder="••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    <span>2FA OTP</span>
                    <span className="text-xs text-indigo-600 hover:underline cursor-pointer">Resend OTP</span>
                  </label>
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength="6"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center tracking-widest text-lg font-mono"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-indigo-600 text-white font-bold tracking-wide py-3 px-4 rounded shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all uppercase text-sm"
                >
                  {submitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Process {items.length} Items</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Results Modal */}
        <AnimatePresence>
          {resultData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 mr-2" />
                    Corporate Execution Summary
                  </h3>
                  <button onClick={closeResultData} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 bg-white overflow-y-auto flex-1">
                  
                  <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Total Requested</div>
                      <div className="text-3xl font-bold text-gray-800">{resultData.requestedCount || 0}</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="text-sm font-semibold text-green-700 mb-1 uppercase tracking-wider">Success</div>
                      <div className="text-3xl font-bold text-green-600">{resultData.successCount || 0}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="text-sm font-semibold text-red-700 mb-1 uppercase tracking-wider">Failed</div>
                      <div className="text-3xl font-bold text-red-600">
                        {(resultData.requestedCount || 0) - (resultData.successCount || 0)}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-3">Itemized Status Report</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-600">Destination</th>
                          <th className="px-4 py-3 font-semibold text-gray-600">Amount</th>
                          <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                          <th className="px-4 py-3 font-semibold text-gray-600">Reference / Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {resultData.items?.map((resItem, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-gray-700">{resItem.destinationAccountNumber}</td>
                            <td className="px-4 py-3 font-mono font-medium">${resItem.amount?.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              {resItem.status === 'SUCCESS' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" /> SUCCESS
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> FAILED
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                              {resItem.status === 'SUCCESS' ? resItem.transactionReference : <span className="text-red-500">{resItem.errorReason || 'Unknown error'}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button
                    onClick={closeResultData}
                    className="px-6 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Acknowledge & Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default CustomerCorporate;