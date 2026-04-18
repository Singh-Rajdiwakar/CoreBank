import React, { useState } from 'react';
import { X, UserPlus, FileText, Smartphone, Mail, Hash } from 'lucide-react';
import FloatingLabelInput from './FloatingLabelInput';
import { customerAPI } from '../../services/api';

const CreateCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    kycDocumentType: 'PASSPORT',
    kycDocumentNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await customerAPI.createCustomer(formData);
      onSuccess('Customer successfully created!');
      onClose();
      setFormData({
        username: '', email: '', password: '', fullName: '', phoneNumber: '',
        address: '', kycDocumentType: 'PASSPORT', kycDocumentNumber: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer. Please check the details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Onboard New Customer</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Account Login Details</h3>
              <FloatingLabelInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                icon={<UserPlus size={18} />}
              />
              <FloatingLabelInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                icon={<Mail size={18} />}
              />
              <FloatingLabelInput
                label="Temporary Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
              <FloatingLabelInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                icon={<UserPlus size={18} />}
              />
              <FloatingLabelInput
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                icon={<Smartphone size={18} />}
              />
              <FloatingLabelInput
                label="Physical Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">KYC Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <select
                    name="kycDocumentType"
                    value={formData.kycDocumentType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="PASSPORT">Passport</option>
                    <option value="NATIONAL_ID">National ID</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                  </select>
                </div>
              </div>
              <FloatingLabelInput
                label="Document Number"
                name="kycDocumentNumber"
                value={formData.kycDocumentNumber}
                onChange={handleChange}
                required
                icon={<Hash size={18} />}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <span>Creating...</span>
              ) : (
                <span>Onboard Customer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
