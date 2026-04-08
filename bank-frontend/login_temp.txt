import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import FloatingLabelInput from '../../components/forms/FloatingLabelInput';
import axiosClient from '../../api/axiosClient';
import { useStore } from '../../store/useStore';
import RevealText from '../../components/animations/RevealText';

const ROLES = [
  { label: 'Admin', value: 'admin', color: 'bg-purple-100 text-purple-700' },
  { label: 'Manager', value: 'manager', color: 'bg-blue-100 text-blue-700' },
  { label: 'Employee', value: 'employee', color: 'bg-green-100 text-green-700' },
  { label: 'Auditor', value: 'auditor', color: 'bg-orange-100 text-orange-700' },
  { label: 'Customer', value: 'customer', color: 'bg-indigo-100 text-indigo-700' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const loginSuccess = useStore((state) => state.loginSuccess);
  const cardRef = useRef(null);
  const shakeRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Make POST request to /api/auth/login with email and password
      const response = await axiosClient.post('/auth/login', {
        usernameOrEmail: email,
        password: password,
        deviceInfo: 'web',
      });

      console.log('Login response:', response);

      // Extract accessToken and user data from response
      // Handle both wrapped (ApiResponse) and direct response
      const authData = response.data?.data || response.data;
      console.log('Auth data from API:', authData);
      
      const { accessToken, userId, username, roles } = authData;

      if (!accessToken) {
        throw new Error('No access token in response');
      }

      console.log('Raw roles from API:', roles, 'Type:', Array.isArray(roles) ? 'array' : typeof roles);

      // Construct user object - normalize roles to lowercase strings and strip 'role_' prefix
      let normalizedRoles = [];
      if (Array.isArray(roles)) {
        normalizedRoles = roles.map(r => {
          let roleStr = '';
          // Handle different role formats
          if (typeof r === 'string') {
            roleStr = r;
          } else if (typeof r === 'object' && r.name) {
            roleStr = r.name;
          } else if (typeof r === 'object' && r.authority) {
            roleStr = r.authority;
          } else {
            roleStr = String(r);
          }
          // Strip 'role_' prefix and convert to lowercase
          return roleStr.replace(/^role_/i, '').toLowerCase();
        });
      }

      console.log('Normalized roles:', normalizedRoles);

      const user = {
        id: userId,
        username: username,
        roles: normalizedRoles,
      };

      console.log('Final user object:', user);

      // Call loginSuccess from Zustand store
      loginSuccess(user, accessToken);

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to role-specific dashboard
      const primaryRole = normalizedRoles.length > 0 ? normalizedRoles[0] : 'customer';
      const dashboardRoutes = {
        admin: '/dashboard/admin',
        manager: '/dashboard/manager',
        employee: '/dashboard/employee',
        auditor: '/dashboard/auditor',
        customer: '/dashboard/customer',
      };
      
      const targetPath = dashboardRoutes[primaryRole] || '/dashboard/customer';
      console.log('Navigating to:', targetPath);
      navigate(targetPath);
    } catch (err) {
      // Error handling with try-catch
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setSelectedRole(role);
    setError('');
    setLoading(true);
    
    // Demo: use test credentials
    const testCredentials = {
      admin: { email: 'admin@bank.local', password: 'password' },
      manager: { email: 'manager1@bank.local', password: 'password' },
      employee: { email: 'employee1@bank.local', password: 'password' },
      auditor: { email: 'auditor1@bank.local', password: 'password' },
      customer: { email: 'customer1@bank.local', password: 'password' },
    };

    const creds = testCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);

    setTimeout(async () => {
      try {
        // Make POST request to /api/auth/login with test credentials
        const response = await axiosClient.post('/auth/login', {
          usernameOrEmail: creds.email,
          password: creds.password,
          deviceInfo: 'web',
        });

        console.log('Quick login response:', response);

        // Extract accessToken and user data from response
        // Handle both wrapped (ApiResponse) and direct response
        const authData = response.data?.data || response.data;
        console.log('Auth data from API:', authData);
        
        const { accessToken, userId, username, roles } = authData;

        if (!accessToken) {
          throw new Error('No access token in response');
        }

        console.log('Raw roles from API:', roles, 'Type:', Array.isArray(roles) ? 'array' : typeof roles);

        // Construct user object - normalize roles to lowercase strings and strip 'role_' prefix
        let normalizedRoles = [];
        if (Array.isArray(roles)) {
          normalizedRoles = roles.map(r => {
            let roleStr = '';
            // Handle different role formats
            if (typeof r === 'string') {
              roleStr = r;
            } else if (typeof r === 'object' && r.name) {
              roleStr = r.name;
            } else if (typeof r === 'object' && r.authority) {
              roleStr = r.authority;
            } else {
              roleStr = String(r);
            }
            // Strip 'role_' prefix and convert to lowercase
            return roleStr.replace(/^role_/i, '').toLowerCase();
          });
        }

        console.log('Normalized roles:', normalizedRoles);

        const user = {
          id: userId,
          username: username,
          roles: normalizedRoles,
        };

        console.log('Final user object:', user);

        // Call loginSuccess from Zustand store
        loginSuccess(user, accessToken);

        // Small delay to ensure state is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 100));

        // Navigate to role-specific dashboard
        const primaryRole = normalizedRoles.length > 0 ? normalizedRoles[0] : 'customer';
        const dashboardRoutes = {
          admin: '/dashboard/admin',
          manager: '/dashboard/manager',
          employee: '/dashboard/employee',
          auditor: '/dashboard/auditor',
          customer: '/dashboard/customer',
        };
        
        const targetPath = dashboardRoutes[primaryRole] || '/dashboard/customer';
        console.log('Navigating to:', targetPath);
        navigate(targetPath);
      } catch (err) {
        // Error handling with try-catch
        console.error('Quick login error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Quick login failed.';
        setError(errorMessage);
        shake();
        setLoading(false);
        setSelectedRole(null);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div ref={shakeRef} className="w-full max-w-md">
        <motion.div
          ref={cardRef}
          className="card p-8"
          style={{
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">
              <RevealText text="NexPay" className="text-blue-600" />
            </h1>
            <p className="text-gray-600 text-sm">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <FloatingLabelInput
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <FloatingLabelInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-500">Quick Login</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Quick Login Roles */}
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((role) => (
              <motion.button
                key={role.value}
                onClick={() => handleQuickLogin(role.value)}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`py-2 px-3 rounded-full text-xs font-medium transition-all duration-300 ${
                  role.color
                } disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRole === role.value ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                }`}
              >
                {selectedRole === role.value ? 'Loading...' : role.label}
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-600">
            <p>Demo credentials available via quick login buttons</p>
            <p className="mt-4">
              Don't have an account?{' '}
              <motion.a
                href="/register"
                whileHover={{ color: '#2563eb' }}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
              >
                Sign Up
              </motion.a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
