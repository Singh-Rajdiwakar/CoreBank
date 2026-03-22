import React, { useState, useEffect } from 'react'
import { Save, AlertCircle, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { adminAPI } from '../../services/endpoints/admin'

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('system')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [systemConfig, setSystemConfig] = useState({
    bankName: 'NexPay Bank',
    bankCode: 'NEXB',
    maxAccountsPerCustomer: 10,
    maxCardsPerAccount: 5,
    maxBeneficiaries: 20,
    transactionDailyLimit: 500000,
    maintenanceMode: false
  })
  const [interestRates, setInterestRates] = useState({
    savingsRate: 2.5,
    checkingRate: 1.0,
    mmRate: 3.0,
    fdRate1Y: 4.5,
    fdRate2Y: 5.0,
    fdRate3Y: 5.5,
    homeLoанRate: 7.5,
    carLoanRate: 8.5,
    personalLoanRate: 9.5,
    educationLoanRate: 6.5
  })
  const [feeConfig, setFeeConfig] = useState({
    neftFee: 2.5,
    rtgsFee: 5.0,
    impsCharge: 0,
    upiCharge: 0,
    atmWithdrawalFee: 0,
    chequeIssuanceFee: 25,
    accountClosureFee: 100,
    duplicateStatementFee: 10
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const [system, rates, fees] = await Promise.all([
        adminAPI.getSystemConfig().catch(() => ({ data: systemConfig })),
        adminAPI.getInterestRates().catch(() => ({ data: interestRates })),
        adminAPI.getFeeConfig().catch(() => ({ data: feeConfig }))
      ])

      setSystemConfig(system.data || systemConfig)
      setInterestRates(rates.data || interestRates)
      setFeeConfig(fees.data || feeConfig)
    } catch (error) {
      toast.error('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemConfigChange = (field, value) => {
    setSystemConfig(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? parseFloat(value) : value
    }))
  }

  const handleInterestRateChange = (field, value) => {
    setInterestRates(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleFeeChange = (field, value) => {
    setFeeConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleSaveSystemConfig = async () => {
    setSaving(true)
    try {
      await adminAPI.updateSystemConfig(systemConfig)
      toast.success('System configuration updated successfully')
    } catch (error) {
      toast.error('Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInterestRates = async () => {
    setSaving(true)
    try {
      await adminAPI.updateInterestRates(interestRates)
      toast.success('Interest rates updated successfully')
    } catch (error) {
      toast.error('Failed to update interest rates')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFeeConfig = async () => {
    setSaving(true)
    try {
      await adminAPI.updateFeeConfig(feeConfig)
      toast.success('Fee configuration updated successfully')
    } catch (error) {
      toast.error('Failed to update fees')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'system', label: 'System Settings' },
    { id: 'interest', label: 'Interest Rates' },
    { id: 'fees', label: 'Fee Configuration' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">System Configuration</h2>
        <div className="h-96 bg-gray-800 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">System Configuration</h2>
        <p className="text-gray-400 mt-1">Manage bank-wide settings and policies</p>
      </div>

      {/* Maintenance Mode Alert */}
      {systemConfig.maintenanceMode && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <div>
            <p className="text-red-300 font-semibold">Maintenance Mode</p>
            <p className="text-red-200 text-sm">The bank system is currently in maintenance mode. Customers cannot access services.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* System Settings */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name</label>
              <input
                type="text"
                value={systemConfig.bankName}
                onChange={(e) => handleSystemConfigChange('bankName', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bank Code</label>
              <input
                type="text"
                value={systemConfig.bankCode}
                onChange={(e) => handleSystemConfigChange('bankCode', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Accounts Per Customer</label>
              <input
                type="number"
                value={systemConfig.maxAccountsPerCustomer}
                onChange={(e) => handleSystemConfigChange('maxAccountsPerCustomer', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Cards Per Account</label>
              <input
                type="number"
                value={systemConfig.maxCardsPerAccount}
                onChange={(e) => handleSystemConfigChange('maxCardsPerAccount', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Beneficiaries</label>
              <input
                type="number"
                value={systemConfig.maxBeneficiaries}
                onChange={(e) => handleSystemConfigChange('maxBeneficiaries', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Daily Transaction Limit (₹)</label>
              <input
                type="number"
                value={systemConfig.transactionDailyLimit}
                onChange={(e) => handleSystemConfigChange('transactionDailyLimit', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                min="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.maintenanceMode}
                  onChange={(e) => handleSystemConfigChange('maintenanceMode', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-500 text-red-600 focus:ring-2"
                />
                <span className="text-gray-300 font-medium">Enable Maintenance Mode</span>
              </label>
              <p className="text-gray-400 text-sm mt-1">When enabled, customers cannot access the system</p>
            </div>
          </div>

          <button
            onClick={handleSaveSystemConfig}
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      )}

      {/* Interest Rates */}
      {activeTab === 'interest' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Savings Products */}
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Savings Products</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Savings Account (%)</label>
                  <input
                    type="number"
                    value={interestRates.savingsRate}
                    onChange={(e) => handleInterestRateChange('savingsRate', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Checking Account (%)</label>
                  <input
                    type="number"
                    value={interestRates.checkingRate}
                    onChange={(e) => handleInterestRateChange('checkingRate', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Money Market (%)</label>
                  <input
                    type="number"
                    value={interestRates.mmRate}
                    onChange={(e) => handleInterestRateChange('mmRate', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Fixed Deposits */}
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Fixed Deposits</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">1 Year (%)</label>
                  <input
                    type="number"
                    value={interestRates.fdRate1Y}
                    onChange={(e) => handleInterestRateChange('fdRate1Y', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">2 Years (%)</label>
                  <input
                    type="number"
                    value={interestRates.fdRate2Y}
                    onChange={(e) => handleInterestRateChange('fdRate2Y', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">3 Years (%)</label>
                  <input
                    type="number"
                    value={interestRates.fdRate3Y}
                    onChange={(e) => handleInterestRateChange('fdRate3Y', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Loan Products */}
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 md:col-span-2">
              <h3 className="text-white font-semibold mb-4">Loan Products</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Home Loan (%)</label>
                  <input
                    type="number"
                    value={interestRates.homeLoанRate}
                    onChange={(e) => handleInterestRateChange('homeLoанRate', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Car Loan (%)</label>
                  <input
                    type="number"
                    value={interestRates.carLoanRate}
                    onChange={(e) => handleInterestRateChange('carLoanRate', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Personal Loan (%)</label>
                  <input
                    type="number"
                    value={interestRates.personalLoanRate}
                    onChange={(e) => handleInterestRateChange('personalLoanRate', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Education Loan (%)</label>
                  <input
                    type="number"
                    value={interestRates.educationLoanRate}
                    onChange={(e) => handleInterestRateChange('educationLoanRate', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveInterestRates}
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Interest Rates'}
          </button>
        </div>
      )}

      {/* Fee Configuration */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transfer Fees */}
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Transfer Services</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">NEFT Fee (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.neftFee}
                    onChange={(e) => handleFeeChange('neftFee', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">RTGS Fee (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.rtgsFee}
                    onChange={(e) => handleFeeChange('rtgsFee', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">IMPS Charge (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.impsCharge}
                    onChange={(e) => handleFeeChange('impsCharge', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">UPI Charge (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.upiCharge}
                    onChange={(e) => handleFeeChange('upiCharge', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Account Services */}
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Account Services</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">ATM Withdrawal Fee (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.atmWithdrawalFee}
                    onChange={(e) => handleFeeChange('atmWithdrawalFee', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Cheque Issuance Fee (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.chequeIssuanceFee}
                    onChange={(e) => handleFeeChange('chequeIssuanceFee', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Account Closure Fee (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.accountClosureFee}
                    onChange={(e) => handleFeeChange('accountClosureFee', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Duplicate Statement Fee (₹)</label>
                  <input
                    type="number"
                    value={feeConfig.duplicateStatementFee}
                    onChange={(e) => handleFeeChange('duplicateStatementFee', e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveFeeConfig}
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Fee Configuration'}
          </button>
        </div>
      )}
    </div>
  )
}
