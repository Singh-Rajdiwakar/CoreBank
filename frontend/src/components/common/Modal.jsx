import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              ${sizeClasses[size]} w-full mx-4
              glass rounded-2xl overflow-hidden
            `}
          >
            {title && (
              <div className="border-b border-white/20 px-6 py-4">
                <h2 className="text-xl font-orbitron font-bold gradient-text">{title}</h2>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
