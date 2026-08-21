import axios from 'axios';

// Base API URL pointing to the ASP.NET Core Backend
const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || localStorage.getItem('clinic_api_url') || 'http://localhost:5270/api';
};

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    const token = localStorage.getItem('clinic_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('clinic_jwt_token');
      localStorage.removeItem('clinic_user');
    }
    return Promise.reject(error);
  }
);
