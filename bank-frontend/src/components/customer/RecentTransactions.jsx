import { motion } from 'framer-motion';

const RecentTransactions = ({ transactions, loading }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>

      {loading ? (
        <p className="text-gray-600">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-600">No transactions yet</p>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {transactions.slice(0, 5).map((txn, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-sm transition-colors"
            >
              <div>
                <p className="font-medium">{txn.description || 'Transfer'}</p>
                <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</p>
              </div>
              <p className={`font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {txn.amount > 0 ? '+' : '-'}₹{Math.abs(txn.amount)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentTransactions;
