import React, { useState, useEffect } from 'react';
import { beneficiaryAPI } from '../../../services/api';
import { Plus, Trash2, Users, AlertCircle } from 'lucide-react';

const CustomerBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add Beneficiary State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBeni, setNewBeni] = useState({ name: '', accountNumber: '', bankName: '', ifscCode: '' });
  const [addLoading, setAddLoading] = useState(false);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const res = await beneficiaryAPI.getBeneficiaries();
      setBeneficiaries(res.data?.data || res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch beneficiaries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError(null);
    try {
      await beneficiaryAPI.addBeneficiary(newBeni);
      setIsModalOpen(false);
      setNewBeni({ name: '', accountNumber: '', bankName: '', ifscCode: '' });
      fetchBeneficiaries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this beneficiary?')) return;
    try {
      await beneficiaryAPI.deleteBeneficiary(id);
      fetchBeneficiaries();
    } catch (err) {
      setError('Failed to remove beneficiary');
    }
  };

  if (loading) return <div className="text-center p-8">Loading beneficiaries...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Beneficiaries</h1>
          <p className="text-gray-600 mt-1">Add or remove beneficiaries for quick transfers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} /> Add Beneficiary
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {beneficiaries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg">No beneficiaries added yet.</p>
          <p className="text-sm mt-2">Add a beneficiary to start making quick fund transfers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiaries.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{b.name}</h3>
                  <p className="text-sm text-gray-500">{b.bankName}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">A/C Number:</span>
                  <span className="font-semibold">{b.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IFSC:</span>
                  <span className="font-semibold">{b.ifscCode}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(b.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors border border-red-100"
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Beneficiary</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name</label>
                <input 
                  type="text" required value={newBeni.name} onChange={e => setNewBeni({...newBeni, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 outline-none "
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input 
                  type="text" required value={newBeni.accountNumber} onChange={e => setNewBeni({...newBeni, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 outline-none "
                  placeholder="Account Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input 
                  type="text" required value={newBeni.bankName} onChange={e => setNewBeni({...newBeni, bankName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 outline-none "
                  placeholder="e.g. State Bank of India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input 
                  type="text" required value={newBeni.ifscCode} onChange={e => setNewBeni({...newBeni, ifscCode: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 outline-none "
                  placeholder="e.g. SBIN0001234"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={addLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {addLoading ? 'Adding...' : 'Add Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBeneficiaries;
