import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  // Steps: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Actually, we need to handle token/verification.
  // The prompt says: 
  // POST /api/auth/forgot-password (Payload: { email })
  // POST /api/auth/otp/generate & /verify
  // POST /api/auth/reset-password (Payload: { token, newPassword })

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [resetToken, setResetToken] = useState('');

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return showNotification('Please enter your email.', 'error');
    setLoading(true);
    try {
      // 1. Trigger forgot password which generates OTP
      await authAPI.forgotPassword({ email });
      // Or if forgot-password just sends a link, we explicitly generate OTP:
      // await authAPI.generateOtp({ email });
      showNotification('OTP sent to your email address.', 'success');
      setStep(2);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to send OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return showNotification('Please enter the OTP.', 'error');
    setLoading(true);
    try {
      // Verification logic. It might respond with a reset token.
      const res = await authAPI.verifyOtp({ email, otp });
      const token = res.data?.data?.token || res.data?.token || otp; // Fallback token assignment depending on backend
      setResetToken(token);
      showNotification('OTP verified successfully.', 'success');
      setStep(3);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Invalid OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showNotification('Passwords do not match.', 'error');
    }
    if (newPassword.length < 8) {
      return showNotification('Password must be at least 8 characters.', 'error');
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token: resetToken, newPassword });
      showNotification('Password reset successfully. Redirecting to login...', 'success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentStepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              🔐
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot Password</h1>
            <p className="text-gray-500 mt-2 text-sm">
              {step === 1 && "Enter your email address to receive a one-time passcode."}
              {step === 2 && "Enter the 6-digit OTP sent to your email."}
              {step === 3 && "Create a new, secure password."}
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: EMAIL */}
              {step === 1 && (
                <motion.form key="step1" variants={currentStepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition-all" 
                      required
                      autoFocus
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70 flex justify-center items-center h-12">
                    {loading ? <span className="animate-spin text-xl">⏳</span> : 'Send OTP'}
                  </button>
                </motion.form>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <motion.form key="step2" variants={currentStepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Enter OTP</label>
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition-all" 
                      required
                      autoFocus
                    />
                  </div>
                  <button type="submit" disabled={loading || otp.length < 6} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70 flex justify-center items-center h-12">
                    {loading ? <span className="animate-spin text-xl">⏳</span> : 'Verify Code'}
                  </button>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      Change email address
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: RESET PASSWORD */}
              {step === 3 && (
                <motion.form key="step3" variants={currentStepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition-all" 
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Must match new password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition-all" 
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors disabled:opacity-70 flex justify-center items-center h-12">
                    {loading ? <span className="animate-spin text-xl">⏳</span> : 'Reset Password & Login'}
                  </button>
                </motion.form>
              )}

            </AnimatePresence>
          </div>

          {step === 1 && (
            <div className="mt-8 text-center">
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                ← Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
