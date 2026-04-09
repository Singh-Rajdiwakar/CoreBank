import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../../services/api';

const CustomerCreateModal = ({ isOpen, onClose, onSuccess, showNotification }) => {
  const initialState = {
    username: '', password: '', email: '', phone: '',
    firstName: '', lastName: '', dob: '', gender: 'MALE',
    branchId: 1, addressLine1: '', city: '', state: '',
    postalCode: '', country: 'India'
  };

  const [formData, setFormData] = useState(initialState);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialState);
      setError('');
      // Fetch available branches
      adminAPI.getBranches()
        .then(res => {
          const branchData = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.content || []);
          if (branchData.length > 0) {
            setBranches(branchData);
            setFormData(prev => ({ ...prev, branchId: branchData[0].id }));
          }
        })
        .catch(err => console.error("Failed to fetch branches", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminAPI.createCustomer(formData);
      showNotification('Customer created successfully', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create customer. Please check the provided details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Customer</h2>
                <p className="text-sm text-gray-500">Register a new customer account in the system.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="p-6">
            {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
            </div>
            )}

            <form id="createCustomerForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Account Details */}
                <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center border-b pb-2">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                        Account Credentials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                            <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleChange} pattern="^[0-9]{10,15}$" title="Must be 10-15 digits" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="e.g. 9876543210" />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center border-b pb-2">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                            <input required type="date" name="dob" max={new Date().toISOString().split('T')[0]} value={formData.dob} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Branch *</label>
                            <select required name="branchId" value={formData.branchId} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                {branches.length === 0 && <option value="1">Main Branch (Default)</option>}
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name || b.branchName || `Branch #${b.id}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Address Details */}
                <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center border-b pb-2">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                        Address Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                            <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                            <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                            <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                            <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

            </form>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
            <button 
                type="button" 
                onClick={onClose} 
                disabled={loading}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                form="createCustomerForm"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center"
            >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {loading ? 'Creating...' : 'Create Customer'}
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerCreateModal;
