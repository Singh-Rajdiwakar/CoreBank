export const formatCurrency = (amount) => {
  if (!amount) return '₹0.00'
  const num = parseFloat(amount)
  return num.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })
}

export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return ''
  const str = accountNumber.toString()
  return str.slice(0, 4) + '**' + str.slice(-4)
}

export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return ''
  const str = cardNumber.toString()
  return str.slice(0, 4) + ' **** **** ' + str.slice(-4)
}

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const roleRedirect = (roles) => {
  if (!roles || !Array.isArray(roles)) {
    console.error('roleRedirect: Invalid roles input', { roles })
    return '/login'
  }

  if (roles.includes('ROLE_ADMIN')) return '/admin/dashboard'
  if (roles.includes('ROLE_MANAGER')) return '/manager/dashboard'
  if (roles.includes('ROLE_EMPLOYEE')) return '/employee/dashboard'
  if (roles.includes('ROLE_AUDITOR')) return '/audit/dashboard'
  if (roles.includes('ROLE_CUSTOMER')) return '/customer/dashboard'
  
  console.warn('roleRedirect: No matching role found for redirect', { roles })
  return '/login'
}
