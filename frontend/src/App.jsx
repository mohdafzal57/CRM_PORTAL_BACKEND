// src/App.jsx - FULL WORKING VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your existing pages
import Register from './pages/Register';
import Login from './pages/Login';
import {
  Dashboard as AdminDashboard,
  UserManagement,
  AttendanceReports as AttendancePage,
  GeoLocationLogs as GeoLogsPage,
  WorkReports as ReportsPage
} from './pages/admin';

// Intern Pages
import InternDashboard from './pages/intern/Dashboard';
import InternProfile from './pages/intern/Profile';
import InternTasks from './pages/intern/Tasks';
import InternReports from './pages/intern/Reports';

// ============ PLACEHOLDER/UTILITY COMPONENTS ============

// Placeholder for non-admin users
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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const dashboards = {
      'ADMIN': '/admin',
      'HR': '/hr/dashboard',
      'MANAGER': '/manager/dashboard',
      'EMPLOYEE': '/employee/dashboard',
      'INTERN': '/intern/dashboard'
    };
    return <Navigate to={dashboards[user.role] || '/login'} replace />;
  }

  return children;
};

// ============ MAIN APP ============
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['ADMIN']}><AttendancePage /></ProtectedRoute>} />
        <Route path="/admin/geo-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><GeoLogsPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin/export" element={<ProtectedRoute allowedRoles={['ADMIN']}><div>Export Center Coming Soon</div></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><div>Settings Coming Soon</div></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

        {/* Other Role Dashboards */}
        <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR']}><PlaceholderDashboard /></ProtectedRoute>} />
        <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><PlaceholderDashboard /></ProtectedRoute>} />
        <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><PlaceholderDashboard /></ProtectedRoute>} />

        {/* Intern Routes */}
        <Route path="/intern/dashboard" element={<ProtectedRoute allowedRoles={['INTERN']}><InternDashboard /></ProtectedRoute>} />
        <Route path="/intern/profile" element={<ProtectedRoute allowedRoles={['INTERN']}><InternProfile /></ProtectedRoute>} />
        <Route path="/intern/tasks" element={<ProtectedRoute allowedRoles={['INTERN']}><InternTasks /></ProtectedRoute>} />
        <Route path="/intern/reports" element={<ProtectedRoute allowedRoles={['INTERN']}><InternReports /></ProtectedRoute>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;