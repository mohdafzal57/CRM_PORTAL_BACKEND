import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const internApi = {
    // Profile
    getProfile: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/intern/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    updateProfile: async (data) => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/intern/profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Tasks
    getTasks: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/intern/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    submitTask: async (taskData) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/intern/tasks`, taskData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Assigned Tasks
    getAssignedTasks: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/intern/assigned-tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    updateAssignedTaskStatus: async (taskId, status) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/intern/assigned-tasks/${taskId}`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Reports
    submitReport: async (reportData) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/intern/reports`, reportData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default internApi;
