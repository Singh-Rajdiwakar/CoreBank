import { motion } from 'framer-motion';

const RecentTransactions = ({ transactions, loading, isMiniStatement = false }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = Array.isArray(dateString) 
      ? new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3] || 0, dateString[4] || 0, dateString[5] || 0)
      : new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = Array.isArray(dateString) 
      ? new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3] || 0, dateString[4] || 0, dateString[5] || 0)
      : new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get transaction type label and color
  const getTransactionTypeStyle = (transactionType) => {
    if (transactionType === 'DEPOSIT') {
      return { color: 'text-green-600', bgColor: 'bg-green-50', label: 'Deposit', icon: '↓' };
    } else if (transactionType === 'WITHDRAWAL') {
      return { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Withdrawal', icon: '↑' };
    } else if (transactionType === 'TRANSFER') {
      return { color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Transfer', icon: '→' };
    }
    return { color: 'text-gray-600', bgColor: 'bg-gray-50', label: transactionType, icon: '•' };
  };

  const displayTransactions = isMiniStatement ? transactions : transactions;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>

      {displayTransactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No transactions yet</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {displayTransactions.slice(0, 10).map((txn, idx) => {
            const typeStyle = isMiniStatement ? getTransactionTypeStyle(txn.transactionType) : { color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Transfer', icon: '→' };
            const isDeposit = isMiniStatement ? txn.transactionType === 'DEPOSIT' : txn.amount > 0;
            const amount = isMiniStatement ? txn.amount : txn.amount;
            const date = isMiniStatement ? txn.initiatedAt : txn.date;
            const refNumber = isMiniStatement ? txn.referenceNumber : txn.id;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', x: 4 }}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:border-blue-200"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${typeStyle.bgColor} flex items-center justify-center font-bold text-lg ${typeStyle.color}`}>
                    {typeStyle.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{typeStyle.label}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{refNumber}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(date)} • {formatTime(date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="flex-shrink-0 ml-4 text-right">
                  <p className={`text-lg font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                    {isDeposit ? '+' : '-'}₹{Math.abs(amount).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentTransactions;
