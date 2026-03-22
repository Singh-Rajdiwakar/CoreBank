import React from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

export const Input = ({
  label,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'

  return (
    <div className="w-full">
      {label && (
        <motion.label
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="block text-sm font-semibold text-white/80 mb-2"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue/60 w-5 h-5" />
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-white/10 border border-white/20
            text-white placeholder:text-white/50
            focus:outline-none focus:bg-white/15 focus:border-neon-blue/50 focus:shadow-lg focus:shadow-neon-blue/20
            transition-all duration-300
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500/50 bg-red-500/10' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}

export const TextArea = ({
  label,
  placeholder,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-white/80 mb-2">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-white/10 border border-white/20
          text-white placeholder:text-white/50
          focus:outline-none focus:bg-white/15 focus:border-neon-blue/50
          transition-all duration-300 resize-none
          ${error ? 'border-red-500/50 bg-red-500/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}

export const Select = ({
  label,
  options = [],
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-white/80 mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-white/10 border border-white/20
          text-white
          focus:outline-none focus:bg-white/15 focus:border-neon-blue/50
          transition-all duration-300
          ${error ? 'border-red-500/50 bg-red-500/10' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}
