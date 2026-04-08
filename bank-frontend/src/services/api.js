import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bank_token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    if (error.response?.status === 401 && !originalRequest._retry) {
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

        const { access_token, refresh_token } = refreshResponse.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('bank_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
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
};

// Customer API
export const customerAPI = {
  getProfile: () => api.get('/customers/me'),
  getCustomerById: (id) => api.get(`/customers/${id}`),
};

// Account API
export const accountAPI = {
  getAccounts: (customerId) => customerId ? api.get(`/accounts?customerId=${customerId}`) : api.get('/accounts'),
  getAccountById: (id) => api.get(`/accounts/${id}`),
  getAccountsByCustomer: (customerId) => api.get(`/accounts?customerId=${customerId}`),
  createAccount: (data) => api.post('/accounts', data),
  getStatement: (accountNumber) => api.get(`/accounts/${accountNumber}/statement`),
  getMiniStatement: (accountNumber) => api.get(`/accounts/${accountNumber}/mini-statement`),
};

// Transfer API
export const transferAPI = {
  initiateTransfer: (data) => api.post('/transfers', data),
  getTransfers: () => api.get('/transfers'),
  getTransferById: (id) => api.get(`/transfers/${id}`),
  getRecent: () => api.get('/transfers/recent'),
};

// Loan API
export const loanAPI = {
  getLoans: () => api.get('/loans'),
  getLoanById: (id) => api.get(`/loans/${id}`),
  applyForLoan: (data) => api.post('/loans/apply', data),
};

// Card API
export const cardAPI = {
  getCards: () => api.get('/cards'),
  getCardById: (id) => api.get(`/cards/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: () => api.get('/admin/reports'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getEmployees: () => api.get('/admin/employees'),
  getCustomers: () => api.get('/admin/customers'),
  getNotifications: () => api.get('/notifications/unread-count'),
};

// Transaction API
export const transactionAPI = {
  getTransactions: () => api.get('/transactions'),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
};

export default api;
