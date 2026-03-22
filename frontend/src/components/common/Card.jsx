import React from 'react'
import { motion } from 'framer-motion'

export const Card = ({
  children,
  className = '',
  hover = true,
  neonGlow = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, translateY: -5 } : {}}
      transition={{ duration: 0.3 }}
      className={`
        glass rounded-xl p-6 
        ${neonGlow ? 'neon-glow' : 'shadow-lg shadow-black/20'}
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-glass border border-white/20 rounded-xl p-6
        shadow-lg shadow-black/20 hover:bg-white/15 hover:border-white/30 
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
