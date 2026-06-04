import axios from 'axios';

// Create Axios instance with baseURL
const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Check if bank_token exists in localStorage
    const token = localStorage.getItem('bank_token');
    
    if (token) {
      // Attach token to Authorization header as Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response Interceptor (optional - for error handling)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log error details for debugging
    console.error('Axios error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    // Handle response error
    if (error.response?.status === 401) {
      // Token expired or invalid - clear localStorage and redirect if needed
      localStorage.removeItem('bank_token');
      localStorage.removeItem('user');
      // Optional: redirect to login
      // window.location.href = '/login';
    }

    // Handle connection errors
    if (!error.response) {
      console.error('Network error - Backend might not be running');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
