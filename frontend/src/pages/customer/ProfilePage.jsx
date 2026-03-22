import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Upload, Lock, Bell, FileText } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { customerAPI as customersAPI } from '../../services/endpoints/customers'
import { authAPI } from '../../services/endpoints/auth'
import { notificationAPI } from '../../services/endpoints/notifications'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'sonner'
import { formatDate } from '../../utils/formatting'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPinForm, setShowPinForm] = useState(false)
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [pinData, setPinData] = useState({
    transactionPin: '',
    confirmPin: '',
  })

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    debitAlerts: true,
    creditAlerts: true,
    transferAlerts: true,
    securityAlerts: true,
  })

  const [documents, setDocuments] = useState([])

  useEffect(() => {
    loadProfile()
    loadDocuments()
    loadNotificationPreferences()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await customersAPI.getMe()
      const data = response.data
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      })
    } catch (error) {
      toast.error('Failed to load profile')
    }
  }

  const loadDocuments = async () => {
    try {
      const response = await customersAPI.getDocuments(user?.id)
      setDocuments(response.data || [])
    } catch (error) {
      console.log('Failed to load documents')
    }
  }

  const loadNotificationPreferences = async () => {
    try {
      const response = await notificationAPI.getPreferences()
      setNotificationPrefs(response.data || notificationPrefs)
    } catch (error) {
      console.log('Using default notification preferences')
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handlePinChange = (e) => {
    const { name, value } = e.target
    setPinData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await customersAPI.updateProfile(user?.id, profileData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authAPI.changePassword(passwordData.oldPassword, passwordData.newPassword)
      toast.success('Password changed successfully!')
      setShowPasswordForm(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleSetTransactionPin = async (e) => {
    e.preventDefault()
    if (pinData.transactionPin !== pinData.confirmPin) {
      toast.error('PINs do not match')
      return
    }

    setLoading(true)
    try {
      await customersAPI.setTransactionPin(pinData.transactionPin)
      toast.success('Transaction PIN set successfully!')
      setShowPinForm(false)
      setPinData({ transactionPin: '', confirmPin: '' })
    } catch (error) {
      toast.error('Failed to set PIN')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotificationPrefs = async () => {
    setLoading(true)
    try {
      await notificationAPI.updatePreferences(notificationPrefs)
      toast.success('Notification preferences updated!')
      setShowNotificationPrefs(false)
    } catch (error) {
      toast.error('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'PROOF_OF_ADDRESS')

      await customersAPI.uploadDocument(user?.id, formData)
      toast.success('Document uploaded successfully!')
      loadDocuments()
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">My Profile</h1>
        <p className="text-white/60">Manage your account settings and preferences</p>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={20} /> Personal Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="First Name"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
            />
            <Input
              label="Last Name"
              placeholder="Last Name"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
            />
            <Input
              label="Phone Number"
              placeholder="Phone Number"
              name="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleProfileChange}
            />
            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={profileData.dateOfBirth}
              onChange={handleProfileChange}
            />
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Gender</label>
              <select
                name="gender"
                value={profileData.gender}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none transition-all"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <h3 className="font-semibold text-white">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Address"
                placeholder="Street Address"
                name="address"
                value={profileData.address}
                onChange={handleProfileChange}
              />
              <Input
                label="City"
                placeholder="City"
                name="city"
                value={profileData.city}
                onChange={handleProfileChange}
              />
              <Input
                label="State"
                placeholder="State"
                name="state"
                value={profileData.state}
                onChange={handleProfileChange}
              />
              <Input
                label="Pincode"
                placeholder="Pincode"
                name="pincode"
                value={profileData.pincode}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleSaveProfile}
            className="mt-6 px-6 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-all flex items-center gap-2"
          >
            <Save size={18} /> Save Changes
          </motion.button>
        </Card>
      </motion.div>

      {/* Security Section */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Change Password */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock size={20} /> Change Password
            </h2>
          </div>
          <p className="text-white/60 text-sm mb-4">Update your login password</p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowPasswordForm(true)}
          >
            Change Password
          </Button>
        </Card>

        {/* Transaction PIN */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock size={20} /> Transaction PIN
            </h2>
          </div>
          <p className="text-white/60 text-sm mb-4">Secure your transactions</p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowPinForm(true)}
          >
            Set/Update PIN
          </Button>
        </Card>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell size={20} /> Notification Preferences
          </h2>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowNotificationPrefs(true)}
          >
            Manage Preferences
          </Button>
        </Card>
      </motion.div>

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={20} /> KYC Documents
          </h2>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-white/60 text-sm">No documents uploaded yet</p>
            ) : (
              documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-semibold text-sm">{doc.documentType}</p>
                    <p className="text-white/60 text-xs">Uploaded: {formatDate(doc.uploadedAt)}</p>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline text-sm">
                    View
                  </a>
                </div>
              ))
            )}
          </div>

          <label className="mt-4 px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded-lg cursor-pointer hover:bg-neon-blue/30 transition-all flex items-center justify-center gap-2 w-full">
            <Upload size={18} />
            Upload Document
            <input
              type="file"
              hidden
              onChange={handleDocumentUpload}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </label>
        </Card>
      </motion.div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            name="oldPassword"
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowPasswordForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading} disabled={loading}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transaction PIN Modal */}
      <Modal
        isOpen={showPinForm}
        onClose={() => setShowPinForm(false)}
        title="Set Transaction PIN"
        size="md"
      >
        <form onSubmit={handleSetTransactionPin} className="space-y-4">
          <Input
            label="Transaction PIN (6 digits)"
            type="password"
            placeholder="Enter 6-digit PIN"
            name="transactionPin"
            value={pinData.transactionPin}
            onChange={handlePinChange}
            required
            maxLength="6"
            pattern="\d{6}"
          />
          <Input
            label="Confirm PIN"
            type="password"
            placeholder="Confirm PIN"
            name="confirmPin"
            value={pinData.confirmPin}
            onChange={handlePinChange}
            required
            maxLength="6"
            pattern="\d{6}"
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowPinForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading} disabled={loading}>
              Set PIN
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Preferences Modal */}
      <Modal
        isOpen={showNotificationPrefs}
        onClose={() => setShowNotificationPrefs(false)}
        title="Notification Preferences"
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {Object.entries(notificationPrefs).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotificationPrefs(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-neon-blue"
                />
                <span className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button variant="secondary" className="flex-1" onClick={() => setShowNotificationPrefs(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSaveNotificationPrefs} loading={loading} disabled={loading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
