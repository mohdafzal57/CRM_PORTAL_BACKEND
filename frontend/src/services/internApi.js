import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

const internApi = {
    // Profile
    getProfile: async () => {
        const response = await axios.get(`${API_URL}/intern/profile`, { headers: getHeaders() });
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await axios.put(`${API_URL}/intern/profile`, data, { headers: getHeaders() });
        return response.data;
    },

    // Tasks
    getTasks: async () => {
        const response = await axios.get(`${API_URL}/intern/tasks`, { headers: getHeaders() });
        return response.data;
    },
    submitTask: async (taskData) => {
        const response = await axios.post(`${API_URL}/intern/tasks`, taskData, { headers: getHeaders() });
        return response.data;
    },

    // Assigned Tasks
    getAssignedTasks: async () => {
        const response = await axios.get(`${API_URL}/intern/assigned-tasks`, { headers: getHeaders() });
        return response.data;
    },
    updateAssignedTaskStatus: async (taskId, status) => {
        const response = await axios.patch(`${API_URL}/intern/assigned-tasks/${taskId}`, { status }, { headers: getHeaders() });
        return response.data;
    },

    // Reports
    submitReport: async (reportData) => {
        const response = await axios.post(`${API_URL}/intern/reports`, reportData, { headers: getHeaders() });
        return response.data;
    },

    // Attendance
    checkIn: async (checkInData) => {
        const response = await axios.post(`${API_URL}/attendance/check-in`, checkInData, { headers: getHeaders() });
        return response.data;
    },
    checkOut: async (checkOutData) => {
        const response = await axios.post(`${API_URL}/attendance/check-out`, checkOutData, { headers: getHeaders() });
        return response.data;
    },
    getAttendanceHistory: async () => {
        const response = await axios.get(`${API_URL}/attendance/my-history`, { headers: getHeaders() });
        return response.data;
    }
};

export default internApi;
