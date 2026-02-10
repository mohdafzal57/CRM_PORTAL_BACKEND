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

// ==================== DASHBOARD ====================
export const getDashboardStats = () => API.get('/admin/dashboard');

// ==================== USER MANAGEMENT ====================
export const getUsers = (params) => API.get('/admin/users', { params });
export const getUserById = (id) => API.get(`/admin/users/${id}`);
export const createUser = (data) => API.post('/admin/users', data);
export const updateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const toggleUserStatus = (id) => API.patch(`/admin/users/${id}/toggle-status`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// ==================== INTERN MANAGEMENT ====================
export const getInternDetails = (userId) => {
  const sanitizedId = String(userId).trim();
  return API.get(`/admin/interns/${sanitizedId}`);
};

export const updateInternDetailsByAdmin = (userId, data) => {
  const sanitizedId = String(userId).trim();
  return API.put(`/admin/interns/${sanitizedId}`, data);
};

export const assignTaskToIntern = (userId, taskData) => {
  const sanitizedId = String(userId).trim();
  return API.post(`/admin/interns/${sanitizedId}/assign-task`, taskData);
};

// ==================== ATTENDANCE ====================
export const getAttendance = (params) => API.get('/admin/attendance', { params });
export const getAttendanceSummary = (params) => API.get('/admin/attendance/summary', { params });
export const getGeoLogs = (params) => API.get('/admin/attendance/geo-logs', { params });
export const createManualAttendance = (data) => API.post('/admin/attendance/manual', data);
export const updateAttendance = (id, data) => API.put(`/admin/attendance/${id}`, data);
export const deleteAttendance = (id) => API.delete(`/admin/attendance/${id}`);

// ==================== WORK REPORTS ====================
export const getWorkReports = (params) => API.get('/admin/reports', { params });
export const getWorkReportById = (id) => API.get(`/admin/reports/${id}`);
export const reviewWorkReport = (id, data) => API.put(`/admin/reports/${id}/review`, data);
export const getPendingReportsCount = () => API.get('/admin/reports/pending-count');
export const deleteWorkReport = (id) => API.delete(`/admin/reports/${id}`);

// ==================== EXPORT ====================
export const exportData = async (type, format, filters = {}) => {
  try {
    const response = await API.post('/admin/export', 
      { type, format, filters }, 
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_export_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// ==================== SETTINGS ====================
export const getSettings = () => API.get('/admin/settings');
export const updateSettings = (data) => API.put('/admin/settings', data);
export const getHolidays = (params) => API.get('/admin/settings/holidays', { params });
export const addHoliday = (data) => API.post('/admin/settings/holidays', data);
export const deleteHoliday = (date) => API.delete(`/admin/settings/holidays/${date}`);

export default API;