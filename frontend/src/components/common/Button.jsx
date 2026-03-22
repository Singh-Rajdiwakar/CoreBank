import React from 'react'
import { motion } from 'framer-motion'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-neon-blue to-neon-cyan text-white hover:shadow-lg hover:shadow-neon-blue/50 neon-glow',
    secondary: 'glass neon-border-hover text-white',
    ghost: 'bg-transparent border border-white/20 hover:border-white/50 text-white',
    danger: 'bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-300',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-4 h-4 border-2 border-transparent border-t-current rounded-full"
        />
      )}
      {children}
    </motion.button>
  )
}
