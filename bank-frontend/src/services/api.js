import axios from 'axios';
import { useStore } from '../store/useStore';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token and Idempotency key
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bank_token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Automatically add Idempotency-Key for POST/PATCH transfer endpoints
    if (config.method === 'post' || config.method === 'patch') {
      config.headers['Idempotency-Key'] = crypto.randomUUID();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const payload = refreshResponse.data?.data || refreshResponse.data; const access_token = payload.accessToken || payload.access_token; const refresh_token = payload.refreshToken || payload.refresh_token;
        localStorage.setItem('bank_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        useStore.setState({ accessToken: access_token });

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        useStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (usernameOrEmail, password) => api.post('/auth/login', { usernameOrEmail, password }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  generateOtp: (data) => api.post('/auth/otp/generate', data),
  verifyOtp: (data) => api.post('/auth/otp/verify', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Customer API
export const customerAPI = {
  createCustomer: (data) => api.post('/customers', data),
  getProfile: () => api.get('/customers/me'),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  setTransactionPin: (data) => api.post('/customers/me/transaction-pin', data),
  getDocuments: (id) => api.get(`/customers/${id}/documents`),
  uploadDocument: (id, data) => api.post(`/customers/${id}/documents`, data),
};

// Account API
export const accountAPI = {
  getAccounts: (customerId) => customerId ? api.get(`/accounts?customerId=${customerId}`) : api.get('/accounts'),
  getAccountById: (id) => api.get(`/accounts/${id}`),
  getAccountsByCustomer: (customerId) => api.get(`/accounts?customerId=${customerId}`),
  createAccount: (data) => api.post('/accounts', data),
  getStatement: (accountNumber, params) => api.get(`/accounts/${accountNumber}/statement`, { params }),
  getMiniStatement: (accountNumber) => api.get(`/accounts/${accountNumber}/mini-statement`),
  getPassbook: (accountNumber, params) => api.get(`/accounts/${accountNumber}/passbook`, { params }),
  getBalance: (accountNumber) => api.get(`/accounts/${accountNumber}/balance`),
  freeze: (id, remarks) => api.patch(`/accounts/${id}/freeze`, { remarks }),
  unfreeze: (id, remarks) => api.patch(`/accounts/${id}/unfreeze`, { remarks }),
  block: (id, remarks) => api.patch(`/accounts/${id}/block`, { remarks }),
  unblock: (id, remarks) => api.patch(`/accounts/${id}/unblock`, { remarks }),
  reactivate: (id, remarks) => api.patch(`/accounts/${id}/reactivate`, { remarks }),
  closeAccount: (id, remarks) => api.patch(`/accounts/${id}/close`, { remarks }),
};

// Transfer API
export const transferAPI = {
  initiateTransfer: (data) => api.post('/transfers', data),
  internalTransfer: (data) => api.post('/transfers/internal', data),
  upiTransfer: (data) => api.post('/transfers/upi', data),
  impsTransfer: (data) => api.post('/transfers/imps', data),
  neftTransfer: (data) => api.post('/transfers/neft', data),
  rtgsTransfer: (data) => api.post('/transfers/rtgs', data),
  scheduledTransfer: (data) => api.post('/transfers/scheduled', data),
  recurringTransfer: (data) => api.post('/transfers/recurring', data),
  selfTransfer: (data) => api.post('/transfers/self', data),
  externalTransfer: (data) => api.post('/transfers/external', data),
  beneficiaryTransfer: (data) => api.post('/transfers/beneficiary', data),
  reverseTransfer: (reference, data) => api.patch(`/transfers/${reference}/reverse`, data),
  cancelTransfer: (id) => api.patch(`/transfers/${id}/cancel`),
  getTransfers: () => api.get('/transfers'),
  getTransferById: (id) => api.get(`/transfers/${id}`),
  getRecent: () => api.get('/transfers/recent'),
  getReceipt: (id) => api.get(`/transfers/${id}/receipt`),
  // Bulk Transfers
  bulkSalary: (data) => api.post('/transfers/bulk-salary', data),
  bulkFile: (data) => api.post('/transfers/bulk-file', data),
};

// Beneficiary API
export const beneficiaryAPI = {
  getBeneficiaries: () => api.get('/beneficiaries'),
  addBeneficiary: (data) => api.post('/beneficiaries', data),
  verifyBeneficiary: (id) => api.post(`/beneficiaries/${id}/verify`),
  deleteBeneficiary: (id) => api.delete(`/beneficiaries/${id}`),
};

// Loan API
export const loanAPI = {
  getLoans: () => api.get('/loans'),
  getMyLoans: () => api.get('/loans/me'),
  getLoanById: (id) => api.get(`/loans/${id}`),
  applyForLoan: (data) => api.post('/loans', data),
  getEmiSchedule: (id) => api.get(`/loans/${id}/emi-schedule`),
  payEmi: (data) => api.post('/loans/emi/pay', data),
};

// Card API
export const cardAPI = {
  getCards: (accountNumber) => accountNumber ? api.get(`/cards?accountNumber=${accountNumber}`) : api.get('/cards'),
  getCardById: (id) => api.get(`/cards/${id}`),
  getCardTransactions: (cardNumber, limit = 20) => api.get(`/cards/${cardNumber}/transactions?limit=${limit}`),
  updateSettings: (id, data) => api.patch(`/cards/${id}/settings`, data),
  blockCard: (id) => api.patch(`/cards/${id}/block`),
  requestCard: (accountNumber) => api.post(`/cards/request?accountNumber=${accountNumber}`),
  activateCard: (id) => api.patch(`/cards/${id}/activate`),
  unblockCard: (id) => api.patch(`/cards/${id}/unblock`),
  setPin: (id, data) => api.patch(`/cards/${id}/pin`, data),
  hotlistCard: (id) => api.patch(`/cards/${id}/hotlist`),
  atmWithdraw: (data) => api.post(`/cards/atm-withdraw`, data)
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: () => api.get('/admin/reports'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getEmployees: () => api.get('/admin/employees'),
  getCustomers: () => api.get('/customers'),
  createCustomer: (data) => api.post('/customers', data),
  getNotifications: () => api.get('/notifications/unread-count'),
  getDashboardMetrics: () => api.get('/admin/reports/dashboard'),
  getDailyVolume: (date) => api.get(`/admin/reports/daily-volume?date=${date}`),
  getHighValueTransactions: (threshold = 100000) => api.get(`/admin/reports/high-value-transactions?threshold=${threshold}`),
  getBranches: () => api.get('/admin/branches'),
  getBranchById: (id) => api.get(`/admin/branches/${id}`),
  createBranch: (data) => api.post('/admin/branches', data),
  updateBranch: (id, data) => api.put(`/admin/branches/${id}`, data),
  getBranchEmployees: (branchId) => api.get(`/admin/branches/${branchId}/employees`),
  getBranchPerformance: () => api.get('/admin/reports/branch-performance'),
  addEmployee: (data) => api.post('/admin/employees', data),
    updateEmployeeStatus: (id, status) => api.patch(`/admin/employees/${id}/status?status=${status}`),    archiveCustomer: (id) => api.patch(`/customers/${id}/archive`),
  unarchiveCustomer: (id) => api.patch(`/customers/${id}/unarchive`),
  blockCustomer: (id, remarks) => api.patch(`/admin/customers/${id}/block`, { remarks }),
  unblockCustomer: (id, remarks) => api.patch(`/admin/customers/${id}/unblock`, { remarks }),
  getLockedUsers: () => api.get('/admin/users/locked'),
  unlockUser: (id) => api.patch(`/admin/users/${id}/unlock`),
  getSystemConfig: () => api.get('/admin/config/system'),
  updateSystemConfig: (data) => api.post('/admin/config/system', data),
  getInterests: () => api.get('/admin/config/interests'),
  updateInterest: (data) => api.post('/admin/config/interests', data),
  getFees: () => api.get('/admin/config/fees'),
  updateFee: (data) => api.post('/admin/config/fees', data),
  getMonitoring: () => api.get('/admin/monitoring'),
  getNotificationSummary: () => api.get('/notifications/admin/summary'),
  getNotificationQueue: (status = 'PENDING', page = 0, size = 20) => api.get(`/notifications/admin/queue?status=${status}&page=${page}&size=${size}`),
  retryNotificationDispatch: (channel) => api.patch(`/notifications/admin/retry-dispatch?channel=${channel}`),
  cleanupNotifications: () => api.delete('/notifications/admin/cleanup'),
  
  // Phase 22: Advanced Financial Reports
  getRevenueReport: () => api.get('/admin/reports/revenue'),
  getLoanPortfolioReport: () => api.get('/admin/reports/loan-portfolio'),
  getNPASummary: () => api.get('/admin/reports/npa-summary'),
  getReconciliation: (date) => api.get(`/admin/reports/reconciliation?date=${date}`),
  exportDeadLetter: (channel, limit = 100) => api.get(`/notifications/admin/dead-letter/export?channel=${channel}&limit=${limit}`, { responseType: 'blob' }),
};

// Transaction API
export const transactionAPI = {
  getTransactions: () => api.get('/transactions'),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
};

// Deposit API
export const depositAPI = {
  getMyFDs: () => api.get('/deposit-products/fd/me'),
  getMyRDs: () => api.get('/deposit-products/rd/me'),
  openFD: (data) => api.post('/deposit-products/fd', data),
  openRD: (data) => api.post('/deposit-products/rd', data),
  withdrawFD: (fdNumber) => api.patch(`/deposit-products/fd/${fdNumber}/premature-withdraw`),
  payRDInstallment: (rdNumber) => api.patch(`/deposit-products/rd/${rdNumber}/installment`)
};

// Report / Analytics API
export const reportAPI = {
  getMonthlySummary: () => api.get('/reports/me/monthly-summary'),
  getSpendingOverview: (accountNumber) => api.get(`/reports/accounts/spending-overview?accountNumber=${accountNumber}`)
};

// Dispute API
export const disputeAPI = {
  createDispute: (data) => api.post('/disputes', data),
  getMyDisputes: () => api.get('/disputes/me'),
  getDisputeById: (id) => api.get(`/disputes/me/${id}`),
  getDisputeTimeline: (id) => api.get(`/disputes/${id}/timeline`),
  getEvidence: (id) => api.get(`/disputes/${id}/evidence`),
  uploadEvidence: (id, data) => api.post(`/disputes/${id}/evidence`, data)
};

// Notification API
export const notificationAPI = {
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.patch('/notifications/preferences', data),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getMyNotifications: (page = 0, size = 10) => api.get(`/notifications/me?page=${page}&size=${size}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/me/read-all'),
  deliveryCallback: (data) => api.patch('/notifications/callbacks/delivery', data)
};

// Manager API
export const managerAPI = {
  getPendingTransfers: () => api.get('/manager/transfers/pending'),
  approveTransfer: (id, remarks) => api.patch(`/transfers/${id}/approve`, { remarks }),
  rejectTransfer: (id, remarks) => api.patch(`/transfers/${id}/reject`, { remarks }),
  getPendingAccounts: () => api.get('/manager/accounts/pending'), // Added for fetching pending accounts
  approveAccount: (id, remarks) => api.patch(`/accounts/${id}/approve`, { remarks }),
  rejectAccount: (id, remarks) => api.patch(`/accounts/${id}/reject`, { remarks }),
  
  // Loan Processing
  getPendingLoans: () => api.get('/loans'),
  reviewLoan: (id, data) => api.patch(`/loans/${id}/review`, data),
  disburseLoan: (id) => api.patch(`/loans/${id}/disburse`),
    forecloseLoan: (id, remarks) => api.patch(`/loans/${id}/foreclose`, { remarks })
};

export const employeeAPI = {
  getAssignedCustomers: () => api.get('/employee/customers/assigned'),
  getFraudCases: () => api.get('/employee/fraud/cases'),
  reviewFraudCase: (id, data) => api.patch(`/fraud/cases/${id}/review`, data),
  getDisputes: (status) => api.get(`/disputes/ops${status ? `?status=${status}` : ''}`),
  getDisputesSummary: () => api.get('/disputes/ops/summary'),
  assignDispute: (id, data) => api.patch(`/disputes/${id}/assign`, data),
  updateDisputeStatus: (id, data) => api.patch(`/disputes/${id}/status`, data),
  
  // Teller Operations
  getPendingDeposits: () => api.get('/deposits/pending'),
  createDeposit: (data) => api.post('/deposits', data),
  clearDeposit: (reference) => api.patch(`/deposits/${reference}/clear`),
  createWithdrawal: (data) => api.post('/withdrawals', data),
};

// Auditor API
export const auditorAPI = {
  getAuditLogs: (params) => api.get('/audit/logs', { params }),
};

export default api;


