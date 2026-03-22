import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Phone, Zap } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { toast } from 'sonner'
import { authAPI } from '../../services/endpoints/auth'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Password validation according to backend requirements
  const validatePassword = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasDigit = /\d/.test(pwd)
    const hasSpecial = /[@$!%*?&]/.test(pwd)
    const isLongEnough = pwd.length >= 8

    if (!isLongEnough) {
      return 'Password must be at least 8 characters'
    }
    if (!hasUpper) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!hasLower) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!hasDigit) {
      return 'Password must contain at least one digit'
    }
    if (!hasSpecial) {
      return 'Password must contain at least one special character (@$!%*?&)'
    }
    return null
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Frontend validation
    if (!formData.username || !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      toast.error(passwordError)
      setLoading(false)
      return
    }

    // Validate phone format (10-15 digits)
    if (!/^\d{10,15}$/.test(formData.phone)) {
      toast.error('Phone must contain 10 to 15 digits')
      setLoading(false)
      return
    }

    try {
      // Call the actual signup API
      const response = await authAPI.register({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      toast.success('Account created successfully! Redirecting to login...')
      
      // Redirect to login after brief delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created! Please log in with your credentials.',
            prefillUsername: formData.username 
          } 
        })
      }, 1500)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Signup failed. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-neon-dark via-neon-darker to-neon-dark flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">Create Account</h1>
            <p className="text-white/60">Join NexPay Bank today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 mb-8">
            <Input
              label="Username"
              type="text"
              name="username"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={handleChange}
              icon={User}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="Enter 10-15 digit phone"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Min 8 chars: upper, lower, digit, special"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
              Create Account <Zap size={18} />
            </Button>
          </form>

          <div className="border-t border-white/20 pt-6">
            <p className="text-center text-white/60 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-neon-cyan hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-neon-blue/10 border border-neon-blue/20 rounded-lg">
            <p className="text-xs text-white/60">
              <strong>Password Requirements:</strong> Minimum 8 characters with uppercase, lowercase, number and special character (@$!%*?&)
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
