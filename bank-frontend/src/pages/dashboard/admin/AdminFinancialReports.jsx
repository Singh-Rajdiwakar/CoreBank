import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Icons
const CurrencyDollarIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>;
const BriefcaseIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;
const ShieldExclamationIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckBadgeIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>;
const EyeIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const AdminFinancialReports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [revenueData, setRevenueData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [npaData, setNpaData] = useState(null);
  
  // For Reconciliation
  const todayStr = new Date().toISOString().split('T')[0];
  const [reconDate, setReconDate] = useState(todayStr);
  const [reconData, setReconData] = useState(null);

  const tabs = [
    { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
    { id: 'loans', name: 'Loan Portfolio', icon: BriefcaseIcon },
    { id: 'npa', name: 'NPA Summary', icon: ShieldExclamationIcon },
    { id: 'reconciliation', name: 'Reconciliation', icon: CheckBadgeIcon },
  ];

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'revenue' && !revenueData) {
        const res = await adminAPI.getRevenueReport();
        setRevenueData(res.data?.data || res.data);
      } else if (activeTab === 'loans' && !loanData) {
        const res = await adminAPI.getLoanPortfolioReport();
        setLoanData(res.data?.data || res.data);
      } else if (activeTab === 'npa' && !npaData) {
        const res = await adminAPI.getNPASummary();
        setNpaData(res.data?.data || res.data);
      } else if (activeTab === 'reconciliation') {
        const res = await adminAPI.getReconciliation(reconDate);
        setReconData(res.data?.data || res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleReconFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getReconciliation(reconDate);
      setReconData(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reconciliation data for this date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access deep analytics on revenue streams, loan portfolio health, and automated reconciliation.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm flex items-center">
          <ShieldExclamationIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          
          {/* REVENUE REPORT */}
          {activeTab === 'revenue' && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loading && !revenueData ? ( <div className="text-gray-500 text-sm">Loading Revenue Data...</div> ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Gross Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">{revenueData?.totalGross ? formatCurrency(revenueData.totalGross) : '-'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Fee Income</p>
                      <p className="text-3xl font-bold text-gray-900">{revenueData?.feeIncome ? formatCurrency(revenueData.feeIncome) : '-'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Interest Income</p>
                      <p className="text-3xl font-bold text-green-600">{revenueData?.interestIncome ? formatCurrency(revenueData.interestIncome) : '-'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Over Time</h3>
                     {revenueData?.series && revenueData.series.length > 0 ? (
                       <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData.series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                         </ResponsiveContainer>
                       </div>
                     ) : (
                       <div className="h-80 flex items-center justify-center text-gray-400">No chart data available.</div>
                     )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* LOAN PORTFOLIO */}
          {activeTab === 'loans' && (
            <motion.div
              key="loans"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loading && !loanData ? ( <div className="text-gray-500 text-sm">Loading Loan Data...</div> ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Loan Book Value</p>
                      <p className="text-3xl font-bold text-gray-900">{loanData?.totalValue ? formatCurrency(loanData.totalValue) : '-'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Active Loans</p>
                      <p className="text-3xl font-bold text-blue-600">{loanData?.activeCount || 0}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">Loan Distribution</h3>
                     {loanData?.distribution && loanData.distribution.length > 0 ? (
                       <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={loanData.distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="type" stroke="#9ca3af" fontSize={12} />
                              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value/1000000}M`} />
                              <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => formatCurrency(value)} />
                              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                         </ResponsiveContainer>
                       </div>
                     ) : (
                       <div className="h-80 flex items-center justify-center text-gray-400">No chart data available.</div>
                     )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* NPA SUMMARY */}
          {activeTab === 'npa' && (
            <motion.div
              key="npa"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loading && !npaData ? ( <div className="text-gray-500 text-sm">Loading NPA Summary...</div> ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                  {/* Warning background styling */}
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <ShieldExclamationIcon className="w-48 h-48 text-red-600" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-red-900 mb-2">Non-Performing Assets (NPA)</h3>
                    <p className="text-red-700 text-sm mb-6">Warning: Accounts listed here have high default risk or missed consecutive payments.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                       <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center">
                         <span className="text-red-800 font-medium">Total NPA Value</span>
                         <span className="text-2xl font-bold text-red-600">{npaData?.totalValue ? formatCurrency(npaData.totalValue) : '-'}</span>
                       </div>
                       <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center">
                         <span className="text-red-800 font-medium">High Risk Accounts</span>
                         <span className="text-2xl font-bold text-orange-600">{npaData?.riskCount || 0}</span>
                       </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                       <div className="px-5 py-3 border-b border-red-100 bg-red-50/50">
                         <h4 className="text-sm font-bold text-red-800">High-Risk Portfolios</h4>
                       </div>
                       <table className="min-w-full divide-y divide-red-100">
                         <thead className="bg-gray-50">
                           <tr>
                             <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account</th>
                             <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Risk Level</th>
                             <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Overdue Amount</th>
                             <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                           </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-red-100">
                           {npaData?.assets && npaData.assets.length > 0 ? (
                             npaData.assets.map((asset, idx) => (
                               <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.accountId}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                     asset.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                   }`}>
                                     {asset.riskLevel}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(asset.overdueAmount)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                   <button className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full">
                                     <EyeIcon className="w-4 h-4 mr-1"/> View
                                   </button>
                                 </td>
                               </tr>
                             ))
                           ) : (
                             <tr>
                               <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                                 No high-risk NPAs dynamically reported.
                               </td>
                             </tr>
                           )}
                         </tbody>
                       </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* RECONCILIATION */}
          {activeTab === 'reconciliation' && (
            <motion.div
              key="reconciliation"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                   <div>
                     <h3 className="text-lg font-bold text-gray-900">Daily Reconciliation</h3>
                     <p className="text-sm text-gray-500">Cross-verify expected versus actual transactions.</p>
                   </div>
                   <form onSubmit={handleReconFetch} className="flex gap-2">
                     <input
                       type="date"
                       className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                       value={reconDate}
                       onChange={(e) => setReconDate(e.target.value)}
                       required
                     />
                     <button
                       type="submit"
                       disabled={loading}
                       className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                     >
                       {loading ? 'Fetching...' : 'Verify'}
                     </button>
                   </form>
                </div>
                
                <div className="overflow-x-auto min-h-[300px]">
                  {loading ? (
                    <div className="flex justify-center items-center h-48 text-gray-500">Loading reconciliation data...</div>
                  ) : reconData?.records && reconData.records.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Provider / Ref</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expected</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actual Ledger</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Discrepancy</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reconData.records.map((rec, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.reference}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(rec.expected)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(rec.actual)}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${rec.difference !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(rec.difference)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                rec.status === 'MATCHED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                       <CheckBadgeIcon className="w-12 h-12 mb-2 text-gray-300" />
                       <p>No discrepancy records or data available for {reconDate}.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminFinancialReports;
