import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import FloatingLabelInput from '../../components/forms/FloatingLabelInput';
import axiosClient from '../../api/axiosClient';
import RevealText from '../../components/animations/RevealText';

const RegisterPage = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const shakeRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Card drop-in animation
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const shake = () => {
    if (shakeRef.current) {
      gsap.to(shakeRef.current, {
        x: -10,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be 10 digits');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      shake();
      return;
    }

    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      console.log('Registration response:', response);

      // Show success message
      setSuccess('Account created successfully! Redirecting to login...');

      // Clear form
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        firstName: '',
        lastName: '',
      });
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div ref={shakeRef} className="w-full max-w-2xl">
        <motion.div
          ref={cardRef}
          className="card p-8 md:p-10"
          style={{
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">
              <RevealText text="NexPay" className="text-blue-600" />
            </h1>
            <p className="text-gray-600 text-sm">Create your premium banking account</p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* First Row: First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingLabelInput
                id="firstName"
                type="text"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
              <FloatingLabelInput
                id="lastName"
                type="text"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Second Row: Email */}
            <FloatingLabelInput
              id="email"
              type="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Third Row: Username & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingLabelInput
                id="username"
                type="text"
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
              <FloatingLabelInput
                id="phone"
                type="tel"
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=""
                disabled={loading}
              />
            </div>

            {/* Fourth Row: Password */}
            <FloatingLabelInput
              id="password"
              type="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Fifth Row: Confirm Password */}
            <FloatingLabelInput
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center font-medium transition-all duration-300 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95 w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <motion.a
                href="/login"
                whileHover={{ color: '#2563eb' }}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
              >
                Sign In
              </motion.a>
            </p>
          </div>

          {/* Security Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9l3.293 3.293a1 1 0 11-1.414 1.414l-4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-900">Your data is secure</p>
                <p className="text-xs text-gray-600 mt-1">We use industry-leading encryption to protect your personal information.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
