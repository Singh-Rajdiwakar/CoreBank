import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { accountAPI, transferAPI } from '../../../services/api';
import BankCardUI from '../../../components/customer/BankCardUI';
import QuickTransfer from '../../../components/customer/QuickTransfer';
import BalanceCard from '../../../components/customer/BalanceCard';
import RecentTransactions from '../../../components/customer/RecentTransactions';

const CustomerOverview = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [accountsRes, transactionsRes] = await Promise.all([
          accountAPI.getAccounts(),
          transferAPI.getTransfers(),
        ]);

        setAccounts(accountsRes.data || []);
        setTransactions(transactionsRes.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back!</h1>

      {/* Balance Card */}
      <BalanceCard totalBalance={totalBalance} loading={loading} />

      {/* Bank Card & Quick Transfer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BankCardUI account={accounts[0]} />
        <QuickTransfer />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={transactions} loading={loading} />
    </div>
  );
};

export default CustomerOverview;
