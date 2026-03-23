import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { adminAPI } from '../../../services/api';

const StatWidget = ({ icon, label, value, isLoading }) => {
  const numberRef = useRef(null);

  useEffect(() => {
    if (!isLoading && numberRef.current && value) {
      gsap.fromTo(
        { val: 0 },
        {
          val: parseInt(value),
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            if (numberRef.current) {
              numberRef.current.textContent = Math.floor(this.targets()[0].val).toLocaleString();
            }
          },
        }
      );
    }
  }, [isLoading, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 hover:shadow-elegant-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p ref={numberRef} className="text-4xl font-bold text-blue-600 mt-2">
            0
          </p>
        </div>
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
    </motion.div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeAccounts: 0,
    totalDeposits: 0,
    fraudFlagged: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getDashboard();
        setStats({
          totalCustomers: response.data.totalCustomers || 0,
          activeAccounts: response.data.activeAccounts || 0,
          totalDeposits: response.data.totalDeposits || 0,
          fraudFlagged: response.data.fraudFlagged || 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      }
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatWidget
          icon="👥"
          label="Total Customers"
          value={stats.totalCustomers}
          isLoading={loading}
        />
        <StatWidget
          icon="💳"
          label="Active Accounts"
          value={stats.activeAccounts}
          isLoading={loading}
        />
        <StatWidget
          icon="💰"
          label="Total Deposits"
          value={stats.totalDeposits}
          isLoading={loading}
        />
        <StatWidget
          icon="⚠️"
          label="Fraud Flagged"
          value={stats.fraudFlagged}
          isLoading={loading}
        />
      </div>

      {/* Data Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold mb-6">Recent Users</h2>
        <p className="text-gray-600">User management table coming soon...</p>
      </motion.div>
    </div>
  );
};

export default AdminOverview;
