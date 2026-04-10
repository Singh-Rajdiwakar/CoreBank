import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import FloatingLabelInput from '../forms/FloatingLabelInput';
import { transferAPI } from '../../services/api';

const QuickTransfer = () => {
  const [formData, setFormData] = useState({ recipient: '', amount: '', transferType: 'self' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const checkmarkRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await transferAPI.initiateTransfer(formData);

      setSuccess(true);
      gsap.fromTo(
        checkmarkRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out' }
      );

      setTimeout(() => {
        setSuccess(false);
        setFormData({ recipient: '', amount: '', transferType: 'self' });
      }, 2000);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8"
    >
      <h3 className="text-xl font-bold mb-6">Quick Transfer</h3>

      {success && (
        <motion.div ref={checkmarkRef} className="text-center mb-4">
          <div className="text-5xl mb-2">✓</div>
          <p className="text-green-600 font-semibold">Transfer successful!</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Transfer Type</label>
          <select
            value={formData.transferType}
            onChange={(e) => setFormData({ ...formData, transferType: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
          >
            <option value="self">Own Account</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Account</option>
          </select>
        </div>

        <FloatingLabelInput
          id="recipient"
          type="text"
          label="Recipient"
          value={formData.recipient}
          onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
          disabled={loading}
        />

        <FloatingLabelInput
          id="amount"
          type="number"
          label="Amount (₹)"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !formData.recipient || !formData.amount}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center font-medium transition-all duration-300 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Transfer Now'}
        </button>
      </form>
    </motion.div>
  );
};

export default QuickTransfer;
