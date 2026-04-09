import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { authAPI, customerAPI, notificationAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';

const ToggleSwitch = ({ isOn, onToggle }) => {
  return (
    <div 
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isOn ? 'bg-green-500' : 'bg-gray-300'}`}
      onClick={onToggle}
    >
      <motion.div 
        className="bg-white w-4 h-4 rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        animate={{ x: isOn ? 24 : 0 }}
      />
    </div>
  );
};

const SettingsDashboard = () => {
  const { customer } = useStore();
  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE', 'SECURITY', 'NOTIFICATIONS'
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- Profile State ---
  // Using customer object directly for view

  // --- Security State ---
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pinForm, setPinForm] = useState({ transactionPin: '', confirmPin: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return showNotification('New passwords do not match.', 'error');
    }
    if (pwdForm.newPassword.length < 8) {
      return showNotification('Password must be at least 8 characters.', 'error');
    }

    setIsSubmitting(true);
    try {
      await authAPI.changePassword({ 
        currentPassword: pwdForm.currentPassword, 
        newPassword: pwdForm.newPassword 
      });
      showNotification('Password updated successfully.', 'success');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(pinForm.transactionPin)) {
      return showNotification('PIN must be exactly 5 digits.', 'error');
    }
    if (pinForm.transactionPin !== pinForm.confirmPin) {
      return showNotification('PINs do not match.', 'error');
    }

    setIsSubmitting(true);
    try {
      await customerAPI.setTransactionPin({ transactionPin: pinForm.transactionPin });
      showNotification('Transaction PIN set successfully.', 'success');
      setPinForm({ transactionPin: '', confirmPin: '' });
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to set PIN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Notifications State ---
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, inApp: true });
  const [loadingPrefs, setLoadingPrefs] = useState(false);

  const fetchNotificationPrefs = async () => {
    setLoadingPrefs(true);
    try {
      const res = await notificationAPI.getPreferences();
      if (res.data && res.data.data) {
        setNotifPrefs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch preferences', err);
      // Use defaults if missing
    } finally {
      setLoadingPrefs(false);
    }
  };

  const saveNotificationPrefs = async () => {
    try {
      setIsSubmitting(true);
      await notificationAPI.updatePreferences(notifPrefs);
      showNotification('Notification preferences saved.', 'success');
    } catch (err) {
      showNotification('Failed to update preferences', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- KYC & Documents State ---
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docForm, setDocForm] = useState({ documentType: 'AADHAAR', documentNumber: '', fileName: '', fileUrl: '' });

  const fetchDocuments = async () => {
    if (!customer?.id) return;
    setLoadingDocs(true);
    try {
      const res = await customerAPI.getDocuments(customer.id);
      setDocuments(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.content || res.data?.content || [])));
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!customer?.id) return;
    setIsSubmitting(true);
    try {
      await customerAPI.uploadDocument(customer.id, docForm);
      showNotification('Document uploaded successfully.', 'success');
      setDocForm({ documentType: 'AADHAAR', documentNumber: '', fileName: '', fileUrl: '' });
      fetchDocuments();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'NOTIFICATIONS') {
      fetchNotificationPrefs();
    } else if (activeTab === 'DOCUMENTS') {
      fetchDocuments();
    }
  }, [activeTab, customer?.id]);

  const tabs = [
    { id: 'PROFILE', label: 'My Profile', icon: '👤' },
    { id: 'SECURITY', label: 'Security & PIN', icon: '🛡️' },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: '🔔' },
    { id: 'DOCUMENTS', label: 'KYC & Documents', icon: '📄' }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Settings & Preferences</h2>
        <p className="text-gray-500 mt-2">Manage your personal details, security credentials, and alerts.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-start px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-3/4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
              
              {/* PROFILE TAB */}
              {activeTab === 'PROFILE' && (
                <div>
                   <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Personal Information</h3>
                   {customer ? (
                     <div className="space-y-6">
                        <div className="flex items-center justify-center sm:justify-start gap-6">
                           <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold uppercase ring-4 ring-white shadow-md">
                             {customer?.fullName ? customer.fullName[0] : (customer?.username?.[0] || 'C')}
                           </div>
                           <div>
                              <h4 className="text-2xl font-bold text-gray-900">{customer?.fullName || customer?.username || 'Customer'}</h4>
                              <p className="text-gray-500 font-mono text-sm mt-1">Customer ID: {customer.id}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 p-6 bg-gray-50 rounded-2xl">
                           <div>
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                             <p className="text-gray-900 font-medium">{customer.email}</p>
                           </div>
                           <div>
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                             <p className="text-gray-900 font-medium">{customer.phoneNumber}</p>
                           </div>
                           <div className="sm:col-span-2">
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Physical Address</p>
                             <p className="text-gray-900 font-medium">{customer.address || 'Street address line 1, City, State ZIP'}</p>
                           </div>
                           <div>
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</p>
                             <p className="text-gray-900 font-medium">{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                           </div>
                           <div>
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tax ID / PAN</p>
                             <p className="text-gray-900 font-medium">•••• •••• {String(customer.taxId || '1234').slice(-4)}</p>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="text-gray-500">Loading profile details...</div>
                   )}
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'SECURITY' && (
                <div className="space-y-12">
                   
                   {/* Password Form */}
                   <section>
                      <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Change Password</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                         <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                           <input 
                             type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" required
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-1">New Password (Min 8 chars)</label>
                           <input 
                             type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" required
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                           <input 
                             type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" required
                           />
                         </div>
                         <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold text-sm transition-colors">
                           {isSubmitting ? 'Updating...' : 'Update Password'}
                         </button>
                      </form>
                   </section>

                   {/* Transaction PIN Form */}
                   <section>
                      <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Transaction PIN</h3>
                      <p className="text-sm text-gray-500 mb-6">Create or reset your 5-digit PIN used for authorizing funds transfers and payments.</p>
                      <form onSubmit={handlePinChange} className="space-y-4 max-w-md">
                         <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-semibold text-gray-700 mb-1">5-Digit PIN</label>
                              <input 
                                type="password" maxLength={5} placeholder="•••••" value={pinForm.transactionPin} onChange={e => setPinForm({...pinForm, transactionPin: e.target.value.replace(/\D/g, '')})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-center tracking-widest text-lg" required
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm PIN</label>
                              <input 
                                type="password" maxLength={5} placeholder="•••••" value={pinForm.confirmPin} onChange={e => setPinForm({...pinForm, confirmPin: e.target.value.replace(/\D/g, '')})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-center tracking-widest text-lg" required
                              />
                            </div>
                         </div>
                         <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors">
                           {isSubmitting ? 'Saving...' : 'Set Secure PIN'}
                         </button>
                      </form>
                   </section>

                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'NOTIFICATIONS' && (
                <div>
                   <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Alert Preferences</h3>
                   
                   {loadingPrefs ? (
                      <div className="animate-pulse space-y-4">
                         <div className="h-16 bg-gray-100 rounded-xl"></div>
                         <div className="h-16 bg-gray-100 rounded-xl"></div>
                         <div className="h-16 bg-gray-100 rounded-xl"></div>
                      </div>
                   ) : (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                           <div>
                              <p className="font-bold text-gray-900">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive statements, promotional offers, and major alerts via email.</p>
                           </div>
                           <ToggleSwitch isOn={notifPrefs.email} onToggle={() => setNotifPrefs({...notifPrefs, email: !notifPrefs.email})} />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                           <div>
                              <p className="font-bold text-gray-900">SMS / Text Alerts</p>
                              <p className="text-sm text-gray-500">Immediate text alerts for debits, logins, and OTP combinations.</p>
                           </div>
                           <ToggleSwitch isOn={notifPrefs.sms} onToggle={() => setNotifPrefs({...notifPrefs, sms: !notifPrefs.sms})} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                           <div>
                              <p className="font-bold text-gray-900">In-App Notifications</p>
                              <p className="text-sm text-gray-500">Push notifications and badges within the NexPay portal.</p>
                           </div>
                           <ToggleSwitch isOn={notifPrefs.inApp} onToggle={() => setNotifPrefs({...notifPrefs, inApp: !notifPrefs.inApp})} />
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100">
                          <button onClick={saveNotificationPrefs} disabled={isSubmitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">
                            {isSubmitting ? 'Saving...' : 'Save Preferences'}
                          </button>
                        </div>
                     </div>
                   )}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === 'DOCUMENTS' && (
                <div>
                   <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">KYC & Documents</h3>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     
                     {/* Upload Form */}
                     <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4">Upload New Document</h4>
                        <form onSubmit={handleDocumentUpload} className="space-y-4">
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type</label>
                              <select 
                                value={docForm.documentType} onChange={e => setDocForm({...docForm, documentType: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" required
                              >
                                 <option value="AADHAAR">Aadhaar Card</option>
                                 <option value="PAN">PAN Card</option>
                                 <option value="PASSPORT">Passport</option>
                                 <option value="DRIVING_LICENSE">Driving License</option>
                                 <option value="VOTER_ID">Voter ID</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Document Number</label>
                              <input 
                                type="text" value={docForm.documentNumber} onChange={e => setDocForm({...docForm, documentNumber: e.target.value})} placeholder="e.g. ABCDE1234F"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase" required
                              />
                           </div>
                           
                           {/* Drag & Drop Area */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload File (.jpg, .png, .pdf)</label>
                              <div 
                                className="w-full mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl overflow-hidden hover:border-blue-500 hover:bg-blue-50 transition-colors relative"
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    const file = e.dataTransfer.files[0];
                                    setDocForm({...docForm, fileName: file.name, fileUrl: URL.createObjectURL(file)});
                                  }
                                }}
                              >
                                <div className="space-y-2 text-center z-10 flex flex-col items-center">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                      <span>Upload a file</span>
                                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                          const file = e.target.files[0];
                                          setDocForm({...docForm, fileName: file.name, fileUrl: URL.createObjectURL(file)});
                                        }
                                      }}/>
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-gray-500">Max 5MB</p>
                                </div>
                              </div>
                           </div>

                           {docForm.fileName && (
                             <motion.div 
                               initial={{ opacity: 0, height: 0 }} 
                               animate={{ opacity: 1, height: 'auto' }} 
                               className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg"
                             >
                               <div className="flex items-center gap-2 truncate">
                                 <span className="text-blue-600">📎</span>
                                 <span className="text-sm font-medium text-gray-800 truncate">{docForm.fileName}</span>
                               </div>
                               <button type="button" onClick={() => setDocForm({...docForm, fileName: '', fileUrl: ''})} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
                             </motion.div>
                           )}

                           <motion.button 
                             whileTap={{ scale: 0.98 }}
                             type="submit" disabled={isSubmitting} 
                             className="w-full mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
                           >
                             {isSubmitting ? 'Uploading...' : 'Submit Document'}
                           </motion.button>
                        </form>
                     </div>

                     {/* Uploaded Documents List */}
                     <div>
                        <h4 className="font-bold text-gray-900 mb-4">Your Documents</h4>
                        {loadingDocs ? (
                           <div className="animate-pulse space-y-3">
                              <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
                              <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
                           </div>
                        ) : documents.length === 0 ? (
                           <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                             <div className="text-4xl mb-2">📄</div>
                             <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
                           </div>
                        ) : (
                           <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                             <AnimatePresence>
                               {documents.map((doc, idx) => (
                                 <motion.div 
                                   key={doc.id || idx}
                                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                   className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                 >
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                                         {doc.documentType === 'PAN' ? '💳' : doc.documentType === 'PASSPORT' ? '🛂' : '📄'}
                                       </div>
                                       <div>
                                          <p className="font-bold text-gray-900 text-sm">{doc.documentType}</p>
                                          <p className="text-xs text-gray-500 font-mono mt-0.5">{doc.documentNumber}</p>
                                       </div>
                                    </div>
                                    <div>
                                       <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wide ${
                                         doc.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                         doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                       }`}>
                                         {doc.verificationStatus || 'PENDING'}
                                       </span>
                                    </div>
                                 </motion.div>
                               ))}
                             </AnimatePresence>
                           </div>
                        )}
                     </div>
                     
                   </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default SettingsDashboard;
