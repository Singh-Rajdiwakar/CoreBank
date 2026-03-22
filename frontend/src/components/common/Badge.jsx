import React from 'react'
import { motion } from 'framer-motion'

export const Badge = ({ children, variant = 'primary', size = 'md' }) => {
  const variantClasses = {
    primary: 'bg-neon-blue/20 border border-neon-blue/50 text-neon-blue',
    success: 'bg-green-500/20 border border-green-500/50 text-green-300',
    warning: 'bg-amber-500/20 border border-amber-500/50 text-amber-300',
    danger: 'bg-red-500/20 border border-red-500/50 text-red-300',
    secondary: 'glass border-white/30 text-white/80',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-block rounded-full font-semibold
        ${variantClasses[variant]} ${sizeClasses[size]}
      `}
    >
      {children}
    </motion.span>
  )
}
