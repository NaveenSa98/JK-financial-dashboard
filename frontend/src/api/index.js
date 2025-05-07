import axios from 'axios';

// Create an axios instance with default configurations
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for complex ML predictions
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle global errors
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    console.error('API Error:', errorMessage);
    
    return Promise.reject(
      new Error(errorMessage)
    );
  }
);

export default api;