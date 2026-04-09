import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { customerAPI, accountAPI } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import PremiumAccountCard from '../../../components/customer/PremiumAccountCard';
import RecentTransactions from '../../../components/customer/RecentTransactions';
import SkeletonLoader from '../../../components/common/SkeletonLoader';

const CustomerOverview = () => {
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState('');

  // Zustand store
  const customer = useStore((state) => state.customer);
  const primaryAccount = useStore((state) => state.primaryAccount);
  const transactions = useStore((state) => state.transactions);
  const accountLoading = useStore((state) => state.accountLoading);
  
  const setCustomer = useStore((state) => state.setCustomer);
  const setAccounts = useStore((state) => state.setAccounts);
  const setTransactions = useStore((state) => state.setTransactions);
  const setAccountLoading = useStore((state) => state.setAccountLoading);

  // Fetch customer profile and accounts on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setAccountLoading(true);
      try {
        // Fetch customer profile
        const customerRes = await customerAPI.getProfile();
        const customerData = customerRes.data?.data || customerRes.data;
        console.log('Customer data:', customerData);
        setCustomer(customerData);

        // Fetch accounts for this customer
        const customerId = customerData.id || customerData.customerId;
        const accountsRes = await accountAPI.getAccountsByCustomer(customerId);
        const accountsData = Array.isArray(accountsRes.data) ? accountsRes.data : (Array.isArray(accountsRes.data?.data) ? accountsRes.data.data : (accountsRes.data?.data?.content || accountsRes.data?.content || []));
        console.log('Accounts data:', accountsData);
        setAccounts(accountsData);

        setLocalLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard. Please try again.');
        setLocalLoading(false);
      } finally {
        setAccountLoading(false);
      }
    };

    fetchDashboardData();
  }, [setCustomer, setAccounts, setAccountLoading]);

  // Fetch mini-statement when primary account changes
  useEffect(() => {
    const fetchMiniStatement = async () => {
      if (!primaryAccount || !primaryAccount.accountNumber) return;

      setAccountLoading(true);
      try {
        const miniRes = await accountAPI.getMiniStatement(primaryAccount.accountNumber);
        const transactionsData = Array.isArray(miniRes.data) ? miniRes.data : (Array.isArray(miniRes.data?.data) ? miniRes.data.data : (miniRes.data?.data?.content || miniRes.data?.content || []));
        console.log('Transactions data:', transactionsData);
        setTransactions(transactionsData);
      } catch (err) {
        console.error('Failed to fetch mini-statement:', err);
      } finally {
        setAccountLoading(false);
      }
    };

    fetchMiniStatement();
  }, [primaryAccount, setTransactions, setAccountLoading]);

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, <span className="text-blue-600">{(customer?.fullName?.split(' ')[0] || customer?.username || customer?.name) || 'Customer'}</span>!
        </h1>
        <p className="text-gray-600 mt-2">Manage your accounts and transactions</p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Premium Account Card */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Primary Account</h2>
        {localLoading ? (
          <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
        ) : (
          <PremiumAccountCard account={primaryAccount} loading={accountLoading} />
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        {localLoading ? (
          <SkeletonLoader count={5} height="h-20" />
        ) : (
          <RecentTransactions transactions={transactions} loading={accountLoading} isMiniStatement={true} />
        )}
      </div>

      {/* Account Info Cards */}
      {primaryAccount && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ y: -4 }}
            className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600"
          >
            <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Account Status</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{primaryAccount.status || 'Active'}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600"
          >
            <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Account Type</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{primaryAccount.accountType || 'Savings'}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600"
          >
            <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Currency</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{primaryAccount.currency || 'INR'}</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerOverview;

