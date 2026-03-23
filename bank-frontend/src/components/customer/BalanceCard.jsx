import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const BalanceCard = ({ totalBalance, loading }) => {
  const balanceRef = useRef(null);

  useEffect(() => {
    if (!loading && balanceRef.current) {
      gsap.fromTo(
        { val: 0 },
        {
          val: totalBalance,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: function () {
            if (balanceRef.current) {
              balanceRef.current.textContent = `₹${Math.floor(this.targets()[0].val).toLocaleString()}`;
            }
          },
        }
      );
    }
  }, [loading, totalBalance]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100"
    >
      <p className="text-gray-600 text-sm font-medium mb-2">Total Balance</p>
      <h2 ref={balanceRef} className="text-5xl font-bold text-blue-600">
        ₹0
      </h2>
      <p className="text-gray-500 text-sm mt-4">Across all accounts</p>
    </motion.div>
  );
};

export default BalanceCard;
