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
    <div className="relative mb-6 group">
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
        className={`w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed tracking-wide shadow-sm hover:shadow-md ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/20' : 
          'border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 hover:border-gray-300 bg-white focus:bg-blue-50/10'
        }`}
      />
      <motion.label
        htmlFor={id}
        animate={{
          y: isFocused || value ? -10 : 0,
          scale: isFocused || value ? 0.85 : 1,
          color: error ? '#ef4444' : isFocused ? '#2563eb' : '#6b7280',
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute left-4 top-3.5 origin-[-10%] pointer-events-none font-medium select-none"
      >
        {label}
      </motion.label>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-red-500 text-xs mt-1.5 font-medium ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FloatingLabelInput;
