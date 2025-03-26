
import axios from 'axios';

const API_BASE_URL = 'https://caluu.pythonanywhere.com/api';

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
    // Add some logging to help debug
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('Added authorization token to request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
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
