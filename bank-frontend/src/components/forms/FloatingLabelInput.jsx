import { useState } from 'react';
import { motion } from 'framer-motion';

const FloatingLabelInput = ({
  id,
  type = 'text',
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  disabled = false,
  placeholder = '',
  name = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      setIsFocused(false);
    }
    onBlur?.();
  };

  return (
    <div className="relative mb-6">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      />
      <motion.label
        htmlFor={id}
        animate={{
          y: isFocused || value ? -28 : 0,
          fontSize: isFocused || value ? '0.75rem' : '0.95rem',
          color: isFocused ? '#2563eb' : '#6b7280',
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-4 top-3.5 origin-left pointer-events-none font-medium"
      >
        {label}
      </motion.label>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default FloatingLabelInput;
