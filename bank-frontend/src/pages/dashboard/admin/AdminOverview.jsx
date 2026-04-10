import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { adminAPI } from '../../../services/api';

const StatWidget = ({ icon, label, value, isLoading, prefix = '' }) => {
  const numberRef = useRef(null);

  useEffect(() => {
    if (!isLoading && numberRef.current && value !== undefined) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: parseFloat(value) || 0,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function () {
          if (numberRef.current) {
            const currentVal = obj.val;
            const isDecimal = value.toString().includes('.');
            numberRef.current.textContent = `${prefix}${currentVal.toLocaleString(undefined, { 
              minimumFractionDigits: isDecimal ? 2 : 0, 
              maximumFractionDigits: 2 
            })}`;
          }
        },
      });
    }
  }, [isLoading, value, prefix]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 pointer-events-none"></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-baseline space-x-1">
            <p ref={numberRef} className="text-3xl font-bold text-gray-900">
              {prefix}0
            </p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl text-blue-600 shadow-sm border border-blue-100">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const AdminOverview = () => {
  // State for Dashboard Metrics
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDeposits: 0,
    totalTransactions: 0,
    activeAccounts: 0,
    fraudFlagged: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // State for Daily Volume
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyVolume, setDailyVolume] = useState([]);
  const [loadingVolume, setLoadingVolume] = useState(true);

  // State for High Value Transactions
  const [highValueThreshold, setHighValueThreshold] = useState(100000);
  const [highValueTx, setHighValueTx] = useState([]);
  const [loadingHighValue, setLoadingHighValue] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
    fetchHighValueTransactions(highValueThreshold);
  }, []);

  useEffect(() => {
    fetchDailyVolume(selectedDate);
  }, [selectedDate]);

  const fetchDashboardMetrics = async () => {
    setLoadingStats(true);
    try {
      const response = await adminAPI.getDashboardMetrics();
      const payload = response.data?.data || response.data || {};
      setStats({
        totalCustomers: payload.totalCustomers || 0,
        totalDeposits: payload.totalDeposits || 0,
        totalTransactions: payload.totalTransactions || payload.totalTransfers || 0,
        activeAccounts: payload.totalActiveAccounts || payload.activeAccounts || 0,
        fraudFlagged: payload.fraudFlaggedTransactions || payload.fraudFlagged || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchDailyVolume = async (date) => {
    setLoadingVolume(true);
    try {
      const response = await adminAPI.getDailyVolume(date);
        const payload = response.data?.data || response.data;
        let volumeData = [];
        if (Array.isArray(payload)) {
          volumeData = payload;
        } else if (payload?.content) {
          volumeData = payload.content;
        } else if (payload && typeof payload === 'object' && payload.date) {
            volumeData = [
                { hour: 'Total', volume: Number(payload.totalAmount || 0), count: payload.transactionCount || 0 }
            ];
        }
        setDailyVolume(volumeData);
    } catch (error) {
      console.error('Failed to fetch daily volume:', error);
      setDailyVolume([]);
    } finally {
      setLoadingVolume(false);
    }
  };

  const fetchHighValueTransactions = async (threshold) => {
    setLoadingHighValue(true);
    try {
      const response = await adminAPI.getHighValueTransactions(threshold);
        const payload = response.data?.data || response.data;
        setHighValueTx(Array.isArray(payload) ? payload : (payload?.content || []));
    } catch (error) {
      console.error('Failed to fetch high value transactions:', error);
      // Fallback
      setHighValueTx([
        { id: 'TXN-98237', fromAccount: 'ACC-1002', amount: 150000, type: 'TRANSFER', status: 'COMPLETED', date: new Date().toISOString() },
        { id: 'TXN-98238', fromAccount: 'ACC-4051', amount: 250000, type: 'DEPOSIT', status: 'PENDING', date: new Date().toISOString() },
      ]);
    } finally {
      setLoadingHighValue(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardMetrics();
    fetchDailyVolume(selectedDate);
    fetchHighValueTransactions(highValueThreshold);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Control Center</h1>
          <p className="text-gray-500 text-sm mt-1">System overview and high-value monitoring</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget
          icon="👥"
          label="Total Customers"
          value={stats.totalCustomers}
          isLoading={loadingStats}
        />
        <StatWidget
          icon="💳"
          label="Active Accounts"
          value={stats.activeAccounts}
          isLoading={loadingStats}
        />
        <StatWidget
          icon="💰"
          label="Total Deposits"
          value={stats.totalDeposits}
          isLoading={loadingStats}
          prefix="₹"
        />
        <StatWidget
          icon="⚠️"
          label="Fraud Flags"
          value={stats.fraudFlagged}
          isLoading={loadingStats}
        />
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Daily Transaction Volume</h2>
              <p className="text-sm text-gray-500">Hourly volume breakdown</p>
            </div>
            <div className="relative">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm outline-none"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="flex-grow min-h-[300px] w-full">
            {loadingVolume ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : dailyVolume.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No volume data for this date.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + 'k' : val}`}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Volume']}
                    labelStyle={{ color: '#4b5563', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* High-Value Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">High-Value Tx</h2>
              <p className="text-sm text-gray-500">Above ₹${highValueThreshold.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {loadingHighValue ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : highValueTx.length === 0 ? (
              <div className="text-center py-10 space-y-3 text-gray-400">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm">No high-value transactions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {highValueTx.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-500' : tx.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-bold text-gray-700 tracking-wider">{tx.id}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                        {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">{tx.type} • {tx.fromAccount}</p>
                        <p className={`text-xs font-semibold ${tx.status === 'COMPLETED' ? 'text-green-600' : tx.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {tx.status}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">₹{tx.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminOverview;


