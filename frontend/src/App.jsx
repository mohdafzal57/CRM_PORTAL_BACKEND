// src/App.jsx - FULL WORKING VERSION WITH HR ROUTES
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Import your existing pages
import Attendance from "./pages/employee/Attendance";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeReports from "./pages/employee/Reports";
import EmployeeTasks from "./pages/employee/Tasks";

import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import {
  Dashboard as AdminDashboard,
  AttendanceReports as AttendancePage,
  ExportCenter,
  GeoLocationLogs as GeoLogsPage,
  WorkReports as ReportsPage,
  SettingsPage,
  UserManagement
} from './pages/admin';

// HR Pages
import {
  HRDashboard,
  TakeAttendance,
  AttendanceRecords,
  EmployeeDirectory,
  LeaveManagement,
  InternManagement,
  HRReports,
  MyProfile as HRProfile
} from './pages/hr';

// Intern Pages
import InternAttendance from './pages/intern/Attendance';
import InternDashboard from './pages/intern/Dashboard';
import InternProfile from './pages/intern/Profile';
import InternReports from './pages/intern/Reports';
import InternTasks from './pages/intern/Tasks';

// Context Providers
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// ============ PLACEHOLDER/UTILITY COMPONENTS ============

// Placeholder for non-implemented dashboards
const PlaceholderDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>
          ✅
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Welcome, {user.fullName || user.name || 'User'}!</h1>
        <p style={{ color: '#666', marginBottom: '5px' }}>Role: <strong style={{ color: '#3b82f6' }}>{user.role}</strong></p>
        <p style={{ color: '#999', marginBottom: '25px', fontSize: '14px' }}>Your dashboard is coming soon...</p>
        <button
          onClick={handleLogout}
          style={{ padding: '12px 30px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    if (!allowedRoles.includes(userRole)) {
      const dashboards = {
        'ADMIN': '/admin',
        'HR': '/hr',
        'MANAGER': '/manager/dashboard',
        'EMPLOYEE': '/employee/dashboard',
        'INTERN': '/intern/dashboard'
      };
      return <Navigate to={dashboards[userRole] || '/login'} replace />;
    }
  }

  return children;
};

// ============ MAIN APP ============
function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* ==================== PUBLIC ROUTES ==================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ==================== ADMIN ROUTES ==================== */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['ADMIN']}><AttendancePage /></ProtectedRoute>} />
            <Route path="/admin/geo-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><GeoLogsPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
            <Route path="/admin/export" element={<ProtectedRoute allowedRoles={['ADMIN']}><ExportCenter /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />

            {/* ==================== HR ROUTES ==================== */}
            <Route path="/hr" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRDashboard /></ProtectedRoute>} />
            <Route path="/hr/dashboard" element={<Navigate to="/hr" replace />} />
            <Route path="/hr/take-attendance" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><TakeAttendance /></ProtectedRoute>} />
            <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><AttendanceRecords /></ProtectedRoute>} />
            <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><EmployeeDirectory /></ProtectedRoute>} />
            <Route path="/hr/leaves" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><LeaveManagement /></ProtectedRoute>} />
            <Route path="/hr/interns" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><InternManagement /></ProtectedRoute>} />
            <Route path="/hr/reports" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRReports /></ProtectedRoute>} />
            <Route path="/hr/profile" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']}><HRProfile /></ProtectedRoute>} />

            {/* ==================== MANAGER ROUTES ==================== */}
            <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><PlaceholderDashboard /></ProtectedRoute>} />

            {/* ==================== INTERN ROUTES ==================== */}
            <Route path="/intern/dashboard" element={<ProtectedRoute allowedRoles={['INTERN']}><InternDashboard /></ProtectedRoute>} />
            <Route path="/intern/attendance" element={<ProtectedRoute allowedRoles={['INTERN']}><InternAttendance /></ProtectedRoute>} />
            <Route path="/intern/profile" element={<ProtectedRoute allowedRoles={['INTERN']}><InternProfile /></ProtectedRoute>} />
            <Route path="/intern/tasks" element={<ProtectedRoute allowedRoles={['INTERN']}><InternTasks /></ProtectedRoute>} />
            <Route path="/intern/reports" element={<ProtectedRoute allowedRoles={['INTERN']}><InternReports /></ProtectedRoute>} />

            {/* ==================== EMPLOYEE ROUTES ==================== */}
            <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Attendance /></ProtectedRoute>} />
            <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeProfile /></ProtectedRoute>} />
            <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeTasks /></ProtectedRoute>} />
            <Route path="/employee/reports" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeReports /></ProtectedRoute>} />

            {/* ==================== DEFAULT ROUTES ==================== */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;