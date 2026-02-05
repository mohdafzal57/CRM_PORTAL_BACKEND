// src/services/adminApi.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard
export const getDashboardStats = () => API.get('/admin/dashboard');

// Users
export const getUsers = (params) => API.get('/admin/users', { params });
export const createUser = (data) => API.post('/admin/users', data);
export const updateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const toggleUserStatus = (id) => API.patch(`/admin/users/${id}/toggle-status`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// Attendance
export const getAttendance = (params) => API.get('/admin/attendance', { params });
export const getAttendanceSummary = (params) => API.get('/admin/attendance/summary', { params });
export const getGeoLogs = (params) => API.get('/admin/attendance/geo-logs', { params });
export const createManualAttendance = (data) => API.post('/admin/attendance/manual', data);

// Reports
export const getWorkReports = (params) => API.get('/admin/reports', { params });
export const reviewWorkReport = (id, data) => API.put(`/admin/reports/${id}/review`, data);

// Export
export const exportData = async (type, format, filters = {}) => {
  const response = await API.post('/admin/export', { type, format, filters }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}_export.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Settings
export const getSettings = () => API.get('/admin/settings');
export const updateSettings = (data) => API.put('/admin/settings', data);

export default API;