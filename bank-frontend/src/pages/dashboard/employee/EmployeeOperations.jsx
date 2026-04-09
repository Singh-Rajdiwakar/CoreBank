import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  FileText,
  Clock,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { employeeAPI } from '../../../services/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const EmployeeOperations = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [fraudCases, setFraudCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal State
  const [selectedCase, setSelectedCase] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('CLEAR');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'customers') {
        const res = await employeeAPI.getAssignedCustomers();
        setCustomers(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.content || res.data?.content || [])));
      } else {
        const res = await employeeAPI.getFraudCases('OPEN');
        setFraudCases(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.content || res.data?.content || [])));
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    setSubmittingReview(true);
    try {
      await employeeAPI.reviewFraudCase(selectedCase.id, {
        status: reviewStatus,
        notes: reviewNotes
      });
      
      // Update local state to remove the reviewed case
      setFraudCases(prev => prev.filter(fc => fc.id !== selectedCase.id));
      closeModal();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openModal = (fraudCase) => {
    setSelectedCase(fraudCase);
    setReviewNotes('');
    setReviewStatus('CLEAR');
  };

  const closeModal = () => {
    setSelectedCase(null);
    setReviewNotes('');
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage assigned customers and review fraud alerts.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'customers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>My Customers</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'fraud'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Fraud Alerts</span>
            </div>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : activeTab === 'customers' ? (
          /* Customers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No customers assigned to you currently.</p>
              </div>
            ) : (
              customers.map(customer => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={customer.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.fullName || customer.username}</h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                    <span className="text-gray-500">KYC Status:</span>
                    <span className={`font-medium ${
                      customer.kycStatus === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {customer.kycStatus || 'PENDING'}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* Fraud Alerts List */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {fraudCases.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <p>No open fraud alerts at this time.</p>
                <p className="text-sm mt-1">All clear!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {fraudCases.map(fc => (
                  <motion.li 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={fc.id} 
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${getRiskColor(fc.riskScore).split(' ')[1]}`}>
                          <AlertTriangle className={`w-6 h-6 ${getRiskColor(fc.riskScore).split(' ')[0]}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">Transaction #{fc.transactionId?.substring(0,8)}...</h4>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${getRiskColor(fc.riskScore)}`}>
                              Score: {fc.riskScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{fc.reason || 'Suspicious activity detected.'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(fc.createdAt).toLocaleString()}</span>
                            <span>Customer ID: {fc.customerId}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => openModal(fc)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap"
                      >
                        Review Case
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Review Modal */}
        <AnimatePresence>
          {selectedCase && (
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
                    Review Fraud Alert
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleReviewSubmit} className="p-6">
                  <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-gray-500 mb-1">Risk Score</span>
                        <span className={`font-bold ${getRiskColor(selectedCase.riskScore).split(' ')[0]}`}>
                          {selectedCase.riskScore} / 100
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Transaction ID</span>
                        <span className="font-mono">{selectedCase.transactionId?.substring(0,8)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-gray-500 mb-1">Flag Reason</span>
                        <span className="text-gray-800">{selectedCase.reason}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Action</label>
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="CLEAR">Clear (False Positive)</option>
                        <option value="ESCALATE">Escalate to Manager</option>
                        <option value="BLOCK">Block Transaction/Account</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-24 resize-none"
                        placeholder="Detail the findings of your review..."
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={submittingReview}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {submittingReview ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Submit Review
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

export default EmployeeOperations;
