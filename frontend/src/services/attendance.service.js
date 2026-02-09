import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

export const getMyAttendanceHistory = (page = 1, limit = 10) =>
  axios.get(
    `${API}/attendance/my-history?page=${page}&limit=${limit}`,
    authHeader()
  );

export const requestAttendanceCorrection = (data) =>
  axios.post(
    `${API}/attendance/correction`,
    data,
    authHeader()
  );
