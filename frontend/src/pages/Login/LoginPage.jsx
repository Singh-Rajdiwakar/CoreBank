import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Zap } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { roleRedirect } from '../../utils/formatting'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Handle pre-filled username from signup and show signup success message
  useEffect(() => {
    const state = location.state
    if (state?.message) {
      toast.success(state.message)
    }
    if (state?.prefillUsername) {
      setUsername(state.prefillUsername)
    }
  }, [location.state])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(username, password)
      const redirectPath = roleRedirect(user.roles)
      
      if (redirectPath === '/login') {
        // This means no valid role was found
        toast.error('User account is not properly configured with a role')
        return
      }
      
      navigate(redirectPath, { replace: true })
    } catch (error) {
      // Error is already handled by toast in login function
    } finally {
      setLoading(false)
    }
  }

  const quickLoginCredentials = [
    { role: 'Admin', username: 'admin', password: 'password' },
    { role: 'Manager', username: 'manager1', password: 'password' },
    { role: 'Employee', username: 'employee1', password: 'password' },
    { role: 'Auditor', username: 'auditor1', password: 'password' },
    { role: 'Customer', username: 'customer1', password: 'password' },
  ]

  const handleQuickLogin = (cred) => {
    setUsername(cred.username)
    setPassword(cred.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neon-dark via-neon-darker to-neon-dark flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-48 h-64 glass rounded-2xl p-6 neon-glow mb-8"
            >
              <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-cyan/20 rounded-xl flex items-center justify-center text-white text-center">
                <div>
                  <Zap size={48} className="mx-auto mb-4" />
                  <p className="font-semibold">Secure Banking</p>
                  <p className="text-xs text-white/60 mt-2">Next-Generation Security</p>
                </div>
              </div>
            </motion.div>

            <div className="text-center space-y-2">
              <p className="text-2xl font-orbitron font-bold gradient-text">NexPay Bank</p>
              <p className="text-white/60">Banking Beyond Boundaries</p>
            </div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-8 max-w-md w-full"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">Welcome</h1>
              <p className="text-white/60">Sign in to your NexPay account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 mb-8">
              <Input
                label="Username or Email"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={Mail}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="border-t border-white/20 pt-8">
              <p className="text-sm font-semibold text-white/60 mb-4">Quick Login Credentials:</p>
              <div className="space-y-2">
                {quickLoginCredentials.map((cred, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleQuickLogin(cred)}
                    className="w-full text-left px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-blue/50 hover:bg-neon-blue/10 text-sm transition-all duration-300"
                  >
                    <div className="font-semibold text-white/80">{cred.role}</div>
                    <div className="text-xs text-white/50">{cred.username} / {cred.password}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <p className="text-center text-white/50 text-sm mt-8">
              Don't have an account? <a href="/signup" className="text-neon-cyan hover:underline">Sign up</a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
