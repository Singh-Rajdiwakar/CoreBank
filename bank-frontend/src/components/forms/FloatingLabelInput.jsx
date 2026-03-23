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
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="input-base focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
      />
      <motion.label
        htmlFor={id}
        animate={{
          y: isFocused || value ? -24 : 0,
          fontSize: isFocused || value ? '0.875rem' : '1rem',
          color: isFocused ? '#2563eb' : '#000000',
        }}
        transition={{ duration: 0.3 }}
        className="absolute left-4 origin-left pointer-events-none"
      >
        {label}
      </motion.label>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FloatingLabelInput;
