import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Smartphone, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export default function HomePage() {
  const [count1, setCount1] = React.useState(0)
  const [count2, setCount2] = React.useState(0)
  const [count3, setCount3] = React.useState(0)
  const [count4, setCount4] = React.useState(0)

  useEffect(() => {
    const timers = [
      setInterval(() => setCount1((c) => (c < 2 ? c + 0.1 : 2)), 50),
      setInterval(() => setCount2((c) => (c < 50 ? c + 2 : 50)), 50),
      setInterval(() => setCount3((c) => (c < 99.9 ? c + 0.5 : 99.9)), 50),
      setInterval(() => setCount4((c) => (c < 128 ? c + 5 : 128)), 50),
    ]
    return () => timers.forEach(clearInterval)
  }, [])

  const features = [
    { icon: Zap, title: 'UPI Transfer', desc: 'Instant money transfer via UPI' },
    { icon: TrendingUp, title: 'NEFT/RTGS/IMPS', desc: 'Multiple transfer modes' },
    { icon: Lock, title: 'FD & RD', desc: 'Secure deposit products' },
    { icon: Smartphone, title: 'Loans', desc: 'Quick loan disbursement' },
    { icon: Shield, title: 'Dispute Management', desc: 'Secure transaction disputes' },
    { icon: CheckCircle, title: 'Fraud Detection', desc: 'AI-powered security' },
  ]

  const stats = [
    { label: 'Customers', value: count1.toFixed(1) + 'M+' },
    { label: 'Transactions', value: count2.toFixed(0) + 'B+' },
    { label: 'Uptime', value: count3.toFixed(1) + '%' },
    { label: 'Encryption', value: count4.toFixed(0) + '-bit' },
  ]

  return (
    <div className="w-full bg-gradient-to-b from-neon-dark via-neon-darker to-neon-dark overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-orbitron font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Banking Beyond Boundaries
          </motion.h1>

          <motion.h2
            className="text-3xl md:text-5xl font-orbitron font-bold mb-6 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Welcome to NexPay
          </motion.h2>

          <motion.p
            className="text-xl text-white/70 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Next-generation banking for a limitless future. Experience the future of digital banking with cutting-edge technology and 24/7 support.
          </motion.p>

          <motion.div
            className="flex gap-4  justify-center flex-wrap mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Login
              </Button>
            </Link>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-neon-cyan text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-xl p-6 border-t-2 border-neon-blue text-center"
            >
              <p className="text-4xl font-orbitron font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-orbitron font-bold text-center mb-16 gradient-text"
          >
            Powerful Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
                >
                  <Icon className="text-neon-blue mb-4" size={32} />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-12">
          <div className="flex items-start gap-8">
            <Shield className="text-neon-cyan flex-shrink-0 mt-2" size={48} />
            <div>
              <h2 className="text-3xl font-orbitron font-bold mb-4 text-white">Bank-Grade Security</h2>
              <p className="text-white/70 mb-4">
                Your security is our priority. We use military-grade encryption and AI-powered fraud detection to keep your funds safe.
              </p>
              <ul className="space-y-2 text-white/60">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  Fraud AI Detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  OTP Authentication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  Transaction PIN Protection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  Complete Audit Logs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neon-blue/20 px-4 py-12 bg-black/50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-orbitron font-bold gradient-text mb-4">NexPay</h1>
          <p className="text-white/60 mb-6">Banking Beyond Boundaries • Banking from 2035</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
