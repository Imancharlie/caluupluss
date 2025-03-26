
import axios from 'axios';

const API_BASE_URL = 'https://caluu.pythonanywhere.com/api';

// Function to get CSRF token
const getCSRFToken = () => {
  const csrfToken = document.cookie
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('csrftoken='));
  
  if (!csrfToken) return null;
  
  return csrfToken.split('=')[1];
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.log('Unauthorized request detected, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
