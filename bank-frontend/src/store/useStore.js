import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Auth state
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,

  // Account state
  customer: null,
  accounts: [],
  primaryAccount: null,
  transactions: [],
  accountLoading: false,

  // Auth actions
  loginSuccess: (userData, accessToken) => {
    // Store token in localStorage
    localStorage.setItem('bank_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));

    set({
      user: userData,
      accessToken: accessToken,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('bank_token');
    localStorage.removeItem('user');

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      customer: null,
      accounts: [],
      primaryAccount: null,
      transactions: [],
    });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  // Account actions
  setCustomer: (customer) => {
    set({ customer });
  },

  setAccounts: (accounts) => {
    set({ 
      accounts,
      primaryAccount: accounts && accounts.length > 0 ? accounts[0] : null,
    });
  },

  setPrimaryAccount: (account) => {
    set({ primaryAccount: account });
  },

  setTransactions: (transactions) => {
    set({ transactions });
  },

  setAccountLoading: (accountLoading) => {
    set({ accountLoading });
  },

  // Hydrate from localStorage on app load
  hydrate: () => {
    const token = localStorage.getItem('bank_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        set({
          accessToken: token,
          user: JSON.parse(user),
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to hydrate auth state:', error);
        localStorage.removeItem('bank_token');
        localStorage.removeItem('user');
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },
}));
