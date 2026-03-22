import React from 'react'
import { motion } from 'framer-motion'

export const Skeleton = ({ count = 1, height = 16, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            backgroundSize: '200% 200%',
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
          }}
          className={`rounded-lg bg-white/10 h-${height}}`}
        />
      ))}
    </div>
  )
}

export const LoadingSpinner = ({ size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 2 }}
      className={`
        ${sizeClasses[size]}
        border-3 border-white/20 border-t-neon-blue rounded-full
      `}
    />
  )
}

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-white/80 font-orbitron">Loading...</p>
      </motion.div>
    </div>
  )
}
