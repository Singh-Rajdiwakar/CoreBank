import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export const Sidebar = ({ items }) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 256 }}
      className="bg-neon-darker/80 backdrop-blur-glass border-r border-neon-blue/20 h-screen fixed left-0 top-0 z-30"
    >
      <div className="p-4 border-b border-neon-blue/20 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-orbitron font-bold gradient-text">NexPay</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300
                ${
                  active
                    ? 'bg-neon-blue/20 border-l-2 border-neon-blue text-neon-blue'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neon-blue/20">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-semibold">Logout</span>}
        </button>
      </div>
    </motion.div>
  )
}
