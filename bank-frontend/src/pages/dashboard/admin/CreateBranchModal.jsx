import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../../services/api';

const CreateBranchModal = ({ isOpen, onClose, onBranchCreated, showNotification }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    branchCode: '',
    ifscCode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    contactEmail: '',
    contactPhone: '',
    managerUserId: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let newErrors = {};

    const requiredFields = [
      'name', 'branchCode', 'ifscCode', 'addressLine1', 
      'city', 'state', 'postalCode', 'contactEmail', 'contactPhone'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (showNotification) showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.managerUserId) {
        payload.managerUserId = Number(payload.managerUserId);
      } else {
        payload.managerUserId = null;
      }
      
      const response = await adminAPI.createBranch(payload);
      if (showNotification) showNotification('Branch created successfully!', 'success');
      
      setFormData({
        name: '', branchCode: '', ifscCode: '', addressLine1: '', addressLine2: '', 
        city: '', state: '', postalCode: '', contactEmail: '', contactPhone: '', managerUserId: ''
      });
      
      if (onBranchCreated && response.data) {
        onBranchCreated(response.data);
      }
      
      onClose();
    } catch (err) {
      console.error('Create branch error:', err);
      const errMsg = err.response?.data?.message || 'Failed to create branch. Please check inputs.';
      if (showNotification) showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Create New Branch</h3>
                <p className="text-sm text-gray-500">Configure a new bank branch entity</p>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="create-branch-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Details */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Branch Identity
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                      <input 
                        type="text" name="name" 
                        value={formData.name} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="HQ Main" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code *</label>
                      <input 
                        type="text" name="branchCode" 
                        value={formData.branchCode} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.branchCode ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="BR-001" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                      <input 
                        type="text" name="ifscCode" 
                        value={formData.ifscCode} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.ifscCode ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="BANK0000001" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manager User ID (Optional)</label>
                      <input 
                        type="number" name="managerUserId" 
                        value={formData.managerUserId} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300" 
                        placeholder="e.g. 5" 
                      />
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location & Contact
                  </h4>
                  <div className="grid grid-cols-1 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                      <input 
                        type="text" name="addressLine1" 
                        value={formData.addressLine1} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.addressLine1 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="123 Bank Street" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <input 
                        type="text" name="addressLine2" 
                        value={formData.addressLine2} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300" 
                        placeholder="Suite 500" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input 
                        type="text" name="city" 
                        value={formData.city} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="New York" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input 
                        type="text" name="state" 
                        value={formData.state} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="NY" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                      <input 
                        type="text" name="postalCode" 
                        value={formData.postalCode} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="10001" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                      <input 
                        type="email" name="contactEmail" 
                        value={formData.contactEmail} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.contactEmail ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="branch@bank.com" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                      <input 
                        type="text" name="contactPhone" 
                        value={formData.contactPhone} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 ${errors.contactPhone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        placeholder="+1-555-0100" 
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 sticky bottom-0 z-10">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="create-branch-form"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 border border-transparent text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : '+ Create Branch'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateBranchModal;
