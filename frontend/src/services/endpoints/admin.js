import api from '../api'

const ADMIN_ENDPOINTS = {
  DASHBOARD: '/api/admin/reports/dashboard',
  DAILY_VOLUME: '/api/admin/reports/daily-volume',
  BRANCH_PERFORMANCE: '/api/admin/reports/branch-performance',
  HIGH_VALUE_TRANSACTIONS: '/api/admin/reports/high-value-transactions',
  GET_BRANCHES: '/api/admin/branches',
  CREATE_BRANCH: '/api/admin/branches',
  UPDATE_BRANCH: '/api/admin/branches/:id',
  DELETE_BRANCH: '/api/admin/branches/:id',
  GET_EMPLOYEES: '/api/admin/branches/:branchId/employees',
  GET_EMPLOYEES_BY_BRANCH: '/api/admin/branches/:branchId/employees',
  CREATE_EMPLOYEE: '/api/admin/employees',
  UPDATE_EMPLOYEE: '/api/admin/employees/:id',
  UPDATE_EMPLOYEE_STATUS: '/api/admin/employees/:id/status',
  DELETE_EMPLOYEE: '/api/admin/employees/:id',
  GET_CUSTOMERS: '/api/customers',
  UPDATE_CUSTOMER_STATUS: '/api/customers/:id/status',
  REVENUE_REPORT: '/admin/reports/revenue',
  NPA_SUMMARY: '/admin/reports/npa-summary',
  LOAN_PORTFOLIO: '/admin/reports/loan-portfolio',
  RECONCILIATION: '/admin/reports/reconciliation',
  SYSTEM_CONFIG: '/admin/config/system',
  INTEREST_RATES: '/admin/config/interests',
  FEE_CONFIG: '/admin/config/fees',
  MONITORING: '/admin/monitoring',
}

export const adminAPI = {
  getDashboard: () => api.get(ADMIN_ENDPOINTS.DASHBOARD),

  getDailyVolume: () => api.get(ADMIN_ENDPOINTS.DAILY_VOLUME),

  getBranchPerformance: () => api.get(ADMIN_ENDPOINTS.BRANCH_PERFORMANCE),

  getHighValueTransactions: () => api.get(ADMIN_ENDPOINTS.HIGH_VALUE_TRANSACTIONS),

  getBranches: (filters = {}) =>
    api.get(ADMIN_ENDPOINTS.GET_BRANCHES, { params: filters }),

  createBranch: (data) =>
    api.post(ADMIN_ENDPOINTS.CREATE_BRANCH, data),

  updateBranch: (id, data) =>
    api.put(ADMIN_ENDPOINTS.UPDATE_BRANCH.replace(':id', id), data),

  deleteBranch: (id) =>
    api.delete(ADMIN_ENDPOINTS.DELETE_BRANCH.replace(':id', id)),

  getEmployees: (branchId) => {
    if (branchId) {
      return api.get(ADMIN_ENDPOINTS.GET_EMPLOYEES_BY_BRANCH.replace(':branchId', branchId))
    }
    // Get all employees globally
    return api.get('/api/admin/employees')
  },

  createEmployee: (data) =>
    api.post(ADMIN_ENDPOINTS.CREATE_EMPLOYEE, data),

  updateEmployee: (id, data) =>
    api.put(ADMIN_ENDPOINTS.UPDATE_EMPLOYEE.replace(':id', id), data),

  updateEmployeeStatus: (id, status) =>
    api.patch(ADMIN_ENDPOINTS.UPDATE_EMPLOYEE_STATUS.replace(':id', id), { status }),

  deleteEmployee: (id) =>
    api.delete(ADMIN_ENDPOINTS.DELETE_EMPLOYEE.replace(':id', id)),

  getCustomers: (filters = {}) =>
    api.get(ADMIN_ENDPOINTS.GET_CUSTOMERS, { params: filters }),

  updateCustomerStatus: (id, status) =>
    api.patch(ADMIN_ENDPOINTS.UPDATE_CUSTOMER_STATUS.replace(':id', id), { status }),

  getRevenueReport: (dateRange) => 
    api.get(ADMIN_ENDPOINTS.REVENUE_REPORT, { params: { dateRange } }),

  getNpaSummary: (dateRange) => 
    api.get(ADMIN_ENDPOINTS.NPA_SUMMARY, { params: { dateRange } }),

  getLoanPortfolioReport: (dateRange) => 
    api.get(ADMIN_ENDPOINTS.LOAN_PORTFOLIO, { params: { dateRange } }),

  getReconciliationReport: (dateRange) =>
    api.get(ADMIN_ENDPOINTS.RECONCILIATION, { params: { dateRange } }),

  getSystemConfig: () =>
    api.get(ADMIN_ENDPOINTS.SYSTEM_CONFIG),

  updateSystemConfig: (data) =>
    api.post(ADMIN_ENDPOINTS.SYSTEM_CONFIG, data),

  getInterestRates: () =>
    api.get(ADMIN_ENDPOINTS.INTEREST_RATES),

  updateInterestRates: (data) =>
    api.post(ADMIN_ENDPOINTS.INTEREST_RATES, data),

  getFeeConfig: () =>
    api.get(ADMIN_ENDPOINTS.FEE_CONFIG),

  updateFeeConfig: (data) =>
    api.post(ADMIN_ENDPOINTS.FEE_CONFIG, data),

  getMonitoringMetrics: () =>
    api.get(ADMIN_ENDPOINTS.MONITORING),
}
