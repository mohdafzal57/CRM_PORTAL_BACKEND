import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard
export const getDashboardStats = () => API.get('/hr/dashboard');
export const getRecentActivity = () => API.get('/hr/dashboard/activity');

// Attendance
export const getEmployeesForAttendance = (date) => API.get(`/hr/attendance/employees?date=${date}`);
export const saveAttendance = (data) => API.post('/hr/attendance/save', data);
export const getAttendanceRecords = (params) => API.get('/hr/attendance', { params });
export const updateAttendanceRecord = (id, data) => API.put(`/hr/attendance/${id}`, data);

// Employees
export const getEmployees = (params) => API.get('/hr/employees', { params });
export const getEmployeeDetails = (id) => API.get(`/hr/employees/${id}`);

// Leaves
export const getLeaveRequests = (params) => API.get('/hr/leaves', { params });
export const reviewLeave = (id, data) => API.put(`/hr/leaves/${id}/review`, data);

// Interns
export const getInterns = (params) => API.get('/hr/interns', { params });
export const getInternDetails = (userId) => API.get(`/hr/interns/${userId}`);
export const assignTask = (userId, data) => API.post(`/hr/interns/${userId}/assign-task`, data);

// Reports
export const getReport = (type, filters) => API.get(`/hr/reports/${type}`, { params: filters });
export const exportReport = async (type, format, filters) => {
  const response = await API.post(`/hr/reports/${type}/export`, { format, filters }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Profile
export const getMyProfile = () => API.get('/hr/profile');
export const updateMyProfile = (data) => API.put('/hr/profile', data);
export const changePassword = (data) => API.put('/hr/profile/password', data);

export default API;