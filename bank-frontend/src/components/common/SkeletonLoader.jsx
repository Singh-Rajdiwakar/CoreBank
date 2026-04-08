import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 5, height = 'h-20' }) => {
  const pulseVariants = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className={`${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg`}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
