import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const BankCardUI = ({ account }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    gsap.to(cardRef.current, {
      y: -20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 10;
    const y = (e.clientX - rect.left - rect.width / 2) / 10;
    setRotate({ x, y });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotate.x,
        rotateY: rotate.y,
        perspective: '1000px',
      }}
      className="h-56 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-8 text-white shadow-elegant-md cursor-pointer"
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-xs opacity-70 uppercase tracking-widest">NexPay Card</p>
          <p className="text-2xl font-bold mt-2 tracking-widest">
            {account?.cardNumber ? `•••• ${account.cardNumber.slice(-4)}` : '•••• ••••'}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-70">Card Holder</p>
            <p className="font-semibold">{account?.holderName || 'YOUR NAME'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Valid Thru</p>
            <p className="font-semibold">12/26</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BankCardUI;
