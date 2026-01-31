/**
 * Main Application Component
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Dashboard Placeholder
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card max-w-lg w-full text-center animate-fade-in">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {user.fullName || 'User'}!
        </h1>
        <p className="text-gray-600 mb-2">
          You are logged in as <span className="font-semibold text-primary-600">{user.role}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Dashboard coming soon...
        </p>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/hr/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/manager/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/employee/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/intern/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;