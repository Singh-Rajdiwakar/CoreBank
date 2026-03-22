import React from 'react'
import { motion } from 'framer-motion'

export const DashboardLayout = ({ sidebar, navbar, children }) => {
  return (
    <div className="flex">
      {sidebar}
      <div className="flex-1 ml-64">
        {navbar}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-24 px-6 pb-6 min-h-screen bg-gradient-to-b from-neon-darker to-neon-dark"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

export const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
