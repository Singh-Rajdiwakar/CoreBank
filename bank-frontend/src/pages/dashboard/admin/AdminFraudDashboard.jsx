import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../../services/api';
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminFraudDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await employeeAPI.getFraudCases('');
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.content || res.data?.content || []));
        setCases(data);
      } catch (err) {
        console.error('Failed to fetch fraud cases', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const openCases = cases.filter(c => c.status === 'OPEN').length;
  const underReviewCases = cases.filter(c => c.status === 'UNDER_REVIEW').length;
  const confirmedCases = cases.filter(c => c.status === 'CONFIRMED_FRAUD').length;
  const rejectedCases = cases.filter(c => c.status === 'FALSE_POSITIVE').length;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Fraud Analytics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fraud Analytics & Monitoring</h1>
        <p className="text-gray-500 mt-1">System-wide overview of flagged transactions and anomalies.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-50 p-4 rounded-full text-red-600"><ShieldAlert size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Open Flags</p>
            <h3 className="text-2xl font-bold text-gray-900">{openCases}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-50 p-4 rounded-full text-orange-600"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Under Review</p>
            <h3 className="text-2xl font-bold text-gray-900">{underReviewCases}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-rose-50 p-4 rounded-full text-rose-700"><AlertCircle size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Confirmed Fraud</p>
            <h3 className="text-2xl font-bold text-gray-900">{confirmedCases}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-full text-green-600"><CheckCircle2 size={28}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">False Positives</p>
            <h3 className="text-2xl font-bold text-gray-900">{rejectedCases}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Fraud Triggers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Txn Ref</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.length === 0 && (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500">No fraud records found.</td></tr>
              )}
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">#{c.id}</td>
                  <td className="py-4 px-6 text-sm text-blue-600 hover:underline cursor-pointer">{c.transactionRef}</td>
                  <td className="py-4 px-6 text-sm">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      c.fraudScore > 80 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {c.fraudScore || 'High'} / 100
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium">
                    <span className={`uppercase font-bold text-xs ${
                      c.status === 'OPEN' ? 'text-red-600' :
                      c.status === 'UNDER_REVIEW' ? 'text-orange-600' :
                      c.status === 'FALSE_POSITIVE' ? 'text-green-600' : 'text-gray-500'
                    }`}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 max-w-xs truncate">{c.notes || c.aiReasoning || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFraudDashboard;
