import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export const Navbar = ({ title, notificationCount = 0 }) => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 right-0 left-0 bg-neon-darker/80 backdrop-blur-glass border-b border-neon-blue/20 z-20"
    >
      <div className="ml-64 px-6 py-4 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-orbitron font-bold gradient-text"
        >
          {title}
        </motion.h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell size={20} className="text-white/60 hover:text-white" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center text-white font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-white/80">{user?.username}</span>
              <ChevronDown size={16} className="text-white/60" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 glass rounded-lg overflow-hidden shadow-lg">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
