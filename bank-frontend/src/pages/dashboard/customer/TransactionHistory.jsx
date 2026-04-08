import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { accountAPI, transferAPI } from '../../../services/api';

const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 p-6 text-white text-center relative">
           <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
           <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
           </div>
           <h3 className="text-2xl font-bold">Transaction Successful</h3>
           <p className="text-blue-100 font-mono text-sm mt-1">{new Date(receipt.timestamp).toLocaleString()}</p>
        </div>
        <div className="p-8 space-y-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZjNmNGY2IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]">
           <div className="text-center pb-6 border-b border-gray-100 border-dashed">
             <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-1">Amount Transferred</p>
             <p className="text-4xl font-extrabold text-gray-900">₹{receipt.amount?.toLocaleString()}</p>
           </div>
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div><p className="text-gray-500 font-medium">Reference ID</p><p className="font-bold text-gray-900 truncate" title={receipt.referenceNumber}>{receipt.referenceNumber || 'N/A'}</p></div>
             <div><p className="text-gray-500 font-medium">Transfer Mode</p><p className="font-bold text-gray-900">{receipt.mode || 'INTERNAL'}</p></div>
             <div><p className="text-gray-500 font-medium">From Account</p><p className="font-bold text-gray-900">****{String(receipt.sourceAccount || '').slice(-4)}</p></div>
             <div><p className="text-gray-500 font-medium">To Account / UPI</p><p className="font-bold text-gray-900 truncate" title={receipt.destinationAccount || receipt.upiId}>{receipt.upiId || `****${String(receipt.destinationAccount || '').slice(-4)}`}</p></div>
             <div className="col-span-2"><p className="text-gray-500 font-medium">Remarks</p><p className="font-bold text-gray-900">{receipt.remarks || 'N/A'}</p></div>
           </div>
        </div>
        <div className="p-6 bg-gray-50 flex gap-4 text-center">
           <button onClick={() => window.print()} className="flex-1 py-3 px-4 bg-white border border-gray-200 shadow-sm text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">Print</button>
           <button onClick={onClose} className="flex-1 py-3 px-4 bg-blue-600 shadow-sm shadow-blue-200 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Done</button>
        </div>
      </motion.div>
    </div>
  );
};

const TransactionHistory = () => {
  const { primaryAccount, accounts } = useStore();
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination and Filtering State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    from: '',
    to: ''
  });

  const size = 20;

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Initialize selected account
  useEffect(() => {
    if (primaryAccount && !selectedAccountId) {
      setSelectedAccountId(primaryAccount.accountNumber);
    }
  }, [primaryAccount, selectedAccountId]);

  // Fetch Logic
  const fetchTransactions = async (pageNumber = 0, isLoadMore = false, overrideFilters = null) => {
    if (!selectedAccountId) return;
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      const params = {
        page: pageNumber,
        size
      };

      const currentFilters = overrideFilters !== null ? overrideFilters : filters;
      if (currentFilters.from) params.from = currentFilters.from;
      if (currentFilters.to) params.to = currentFilters.to;

      const res = await accountAPI.getStatement(selectedAccountId, params);
      // Depending on API response, it might be in `content` or directly an array, assume Spring Data Page shape or simple list
      let newData = [];
      const rootData = res.data?.data || res.data;
      
      if (rootData?.content) {
         newData = rootData.content;
      } else if (Array.isArray(rootData)) {
         newData = rootData;
      }

      if (isLoadMore) {
        setTransactions(prev => [...prev, ...newData]);
      } else {
        setTransactions(newData);
      }

      // Check if we have more
      if (newData.length < size) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      setPage(pageNumber);

    } catch (err) {
      console.error('Failed to fetch statements:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Run fetch on mount, account change, or filter apply
  useEffect(() => {
    if (selectedAccountId) {
      fetchTransactions(0, false, filters);
    }
  }, [selectedAccountId]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(0, false, filters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { from: '', to: '' };
    setFilters(emptyFilters);
    fetchTransactions(0, false, emptyFilters);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(page + 1, true, filters);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleDownloadReceipt = async (tx) => {
    setLoadingReceipt(true);
    try {
       // Using the transaction's referenceNumber or id as the transfer id. Adjust if backend uses something else.
       const txId = tx.referenceNumber || tx.id;
       const res = await transferAPI.getReceipt(txId);
       let receiptData = res.data?.data || res.data;
       setSelectedReceipt(receiptData);
    } catch (err) {
       console.error('Failed to fetch receipt:', err);
       // Mock receipt data if the backend API 404s (e.g. if it was a generic transaction rather than a registered transfer)
       setSelectedReceipt({
         timestamp: tx.timestamp || tx.date,
         amount: tx.amount,
         referenceNumber: tx.referenceNumber || tx.id,
         mode: tx.type,
         sourceAccount: selectedAccountId,
         destinationAccount: tx.destinationAccount || 'External',
         remarks: tx.description || 'N/A'
       });
    } finally {
       setLoadingReceipt(false);
    }
  };

  const renderTransactionRow = (tx, idx) => {
    // Assuming tx.type is DEPOSIT, WITHDRAWAL, TRANSFER
    // We color code based on type and whether amount is positive or negative for current account
    
    let isCredit = false;
    if (tx.type === 'DEPOSIT') {
      isCredit = true;
    } else if (tx.type === 'TRANSFER' && String(tx.destinationAccount) === String(selectedAccountId)) {
       isCredit = true; // Receiving a transfer
    }

    const sign = isCredit ? '+' : '-';
    const colorClass = isCredit ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    const amountColor = isCredit ? 'text-green-600' : 'text-gray-900';

    return (
      <motion.tr 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.02 }}
        key={tx.id || idx}
        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
      >
        <td className="py-4 px-6">
          <div className="text-sm font-medium text-gray-900">
             {new Date(tx.timestamp || tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">
             {new Date(tx.timestamp || tx.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </td>
        <td className="py-4 px-6">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${colorClass}`}>
              {tx.type}
           </span>
        </td>
        <td className="py-4 px-6">
          <div className="text-sm text-gray-800 font-medium">
             {tx.description || tx.remarks || (isCredit ? 'Credit' : 'Debit')}
          </div>
          {(tx.referenceNumber || tx.id) && (
            <div className="text-xs text-gray-400 font-mono mt-0.5">
               Ref: {tx.referenceNumber || tx.id}
            </div>
          )}
        </td>
        <td className={`py-4 px-6 text-right font-bold tracking-tight ${amountColor}`}>
          <div className="flex flex-col items-end">
            <span>{sign}{formatCurrency(tx.amount)}</span>
            {tx.status !== 'FAILED' && !isCredit && (
               <button 
                  onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(tx); }}
                  className="mt-1 flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium group transition-colors"
               >
                 <svg className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Receipt
               </button>
            )}
          </div>
        </td>
        <td className="py-4 px-6 text-right text-sm text-gray-500 font-medium">
           {tx.balanceAfter ? formatCurrency(tx.balanceAfter) : '-'}
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Account Statement</h2>
           <p className="text-sm text-gray-500 mt-1">View and filter your comprehensive transaction history.</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <select 
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 bg-white shadow-sm"
          >
            {accounts.map(acc => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountType} - ****{String(acc.accountNumber).slice(-4)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row items-end gap-4">
           <div className="w-full sm:w-1/3">
             <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
             <input 
               type="date"
               value={filters.from}
               onChange={(e) => setFilters({...filters, from: e.target.value})}
               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none"
             />
           </div>
           
           <div className="w-full sm:w-1/3">
             <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
             <input 
               type="date"
               value={filters.to}
               onChange={(e) => setFilters({...filters, to: e.target.value})}
               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none"
               max={new Date().toISOString().split('T')[0]} // Max today
             />
           </div>

           <div className="w-full sm:w-1/3 flex gap-3">
             <button
               type="submit"
               className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
             >
               Apply Filter
             </button>
             <button
               type="button"
               onClick={handleClearFilters}
               className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors border border-gray-200"
             >
               Reset
             </button>
           </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         {loading ? (
           <div className="flex justify-center flex-col items-center py-20 text-gray-400">
             <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
             Loading transactions...
           </div>
         ) : error ? (
           <div className="p-10 text-center text-red-500 font-medium">
             {error}
           </div>
         ) : transactions.length === 0 ? (
           <div className="p-16 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
             </div>
             <p className="text-gray-500 font-medium">No transactions found for the selected period.</p>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50/80 border-b border-gray-100">
                   <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                   <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                   <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                   <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                   <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Balance</th>
                 </tr>
               </thead>
               <tbody>
                  <AnimatePresence>
                     {transactions.map((tx, idx) => renderTransactionRow(tx, idx))}
                  </AnimatePresence>
               </tbody>
             </table>
           </div>
         )}
      </div>

      {/* Load More Pagination */}
      {!loading && transactions.length > 0 && (
         <div className="mt-8 flex justify-center pb-12">
            <button
              onClick={handleLoadMore}
              disabled={!hasMore || loadingMore}
              className={`py-2 px-8 rounded-full font-medium transition-colors border shadow-sm ${
                 hasMore 
                   ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                   : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
               {loadingMore ? (
                 <span className="flex items-center">
                   <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin mr-2"></div>
                   Loading...
                 </span>
               ) : hasMore ? 'Load More' : 'End of Statement'}
            </button>
         </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedReceipt && <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
        {loadingReceipt && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
             <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
           </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TransactionHistory;