/**
 * API Service - Centralized API calls with Axios
 */

import axios from 'axios';

// API Base URL - Vite uses import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(data || { message: 'An error occurred' });
  }
);

// ==================== AUTH API CALLS ====================

export const registerAdmin = async (formData) => {
  const response = await api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const adminLogin = async (credentials) => {
  const response = await api.post('/auth/admin/login', credentials);
  return response.data;
};

export const employeeLogin = async (credentials) => {
  const response = await api.post('/auth/employee/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API fails
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ==================== HELPER FUNCTIONS ====================

export const saveAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export default api;