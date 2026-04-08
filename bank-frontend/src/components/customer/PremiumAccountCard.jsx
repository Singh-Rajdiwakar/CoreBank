import { motion } from 'framer-motion';

const PremiumAccountCard = ({ account, loading }) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 animate-pulse"
      />
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No account data available</p>
      </div>
    );
  }

  // Format account number to show last 4 digits
  const accountDisplay = account.accountNumber ? `•••• •••• •••• ${account.accountNumber.slice(-4)}` : 'N/A';
  
  // Format balance
  const balance = account.balance || 0;
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(balance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 30px 40px rgba(0, 0, 0, 0.15)' }}
      transition={{ duration: 0.3 }}
      className="h-64 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl overflow-hidden relative group cursor-pointer"
    >
      {/* Background animated elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl group-hover:blur-2xl transition-all -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl group-hover:blur-2xl transition-all translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top section - Logo and chip */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-blue-100 uppercase tracking-widest font-semibold">Banking Account</p>
            <p className="text-lg font-bold mt-1">NexPay</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg shadow-lg grid grid-cols-2 gap-1 p-1">
            <div className="bg-yellow-400 rounded" />
            <div className="bg-yellow-400 rounded" />
            <div className="bg-yellow-400 rounded" />
            <div className="bg-yellow-400 rounded" />
          </div>
        </div>

        {/* Middle section - Account number */}
        <div>
          <p className="text-xs text-blue-100 uppercase tracking-wider mb-2 font-semibold">Account Number</p>
          <p className="text-2xl font-mono tracking-wider letter-spacing-lg">{accountDisplay}</p>
        </div>

        {/* Bottom section - Balance and cardholder */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold mb-1">Account Balance</p>
            <p className="text-3xl font-bold">{formattedBalance}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold mb-1">Account Type</p>
            <p className="text-lg font-semibold">{account.accountType || 'Savings'}</p>
          </div>
        </div>
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default PremiumAccountCard;
