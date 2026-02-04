// src/App.jsx - FULL WORKING VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your existing pages
import Register from './pages/Register';
import Login from './pages/Login';

// ============ ADMIN COMPONENTS (INLINE) ============

// Simple Admin Layout
const AdminLayout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/admin', label: '📊 Dashboard' },
    { path: '/admin/users', label: '👥 Users' },
    { path: '/admin/attendance', label: '📅 Attendance' },
    { path: '/admin/geo-logs', label: '📍 Geo Logs' },
    { path: '/admin/reports', label: '📝 Reports' },
    { path: '/admin/export', label: '📤 Export' },
    { path: '/admin/settings', label: '⚙️ Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        backgroundColor: '#1e3a5f', 
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '30px', fontSize: '20px' }}>🏢 Admin Portal</h2>
        
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              style={{
                display: 'block',
                padding: '12px 15px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                marginBottom: '5px',
                backgroundColor: window.location.pathname === item.path ? '#3b82f6' : 'transparent'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #ffffff30', paddingTop: '15px' }}>
          <p style={{ fontSize: '14px', marginBottom: '5px' }}>{user.name || user.fullName || 'Admin'}</p>
          <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '15px' }}>{user.email}</p>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '30px' }}>
        {children}
      </main>
    </div>
  );
};

// Admin Dashboard Page
const AdminDashboard = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>⏳ Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Welcome back! Here's what's happening today.</p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Total Employees</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{stats?.counts?.totalEmployees || 0}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Active Users</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>{stats?.counts?.activeUsers || 0}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Disabled Users</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{stats?.counts?.disabledUsers || 0}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Pending Reports</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats?.pendingReports || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <a href="/admin/users" style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', color: '#3b82f6' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>➕</div>
            <span style={{ fontWeight: '500' }}>Add Employee</span>
          </a>
          <a href="/admin/reports" style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', color: '#22c55e' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
            <span style={{ fontWeight: '500' }}>View Reports</span>
          </a>
          <a href="/admin/export" style={{ padding: '20px', backgroundColor: '#faf5ff', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', color: '#a855f7' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📤</div>
            <span style={{ fontWeight: '500' }}>Export Data</span>
          </a>
          <a href="/admin/settings" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', color: '#6b7280' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚙️</div>
            <span style={{ fontWeight: '500' }}>Settings</span>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
};

// User Management Page
const UserManagement = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>User Management</h1>
          <p style={{ color: '#666' }}>Manage employees, interns, and staff</p>
        </div>
        <button style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          ➕ Add User
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '50px', textAlign: 'center' }}>⏳ Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ padding: '50px', textAlign: 'center' }}>No users found</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500' }}>{user.name || user.fullName}</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ padding: '4px 12px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '12px' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ padding: '4px 12px', backgroundColor: user.isActive ? '#f0fdf4' : '#fef2f2', color: user.isActive ? '#22c55e' : '#ef4444', borderRadius: '20px', fontSize: '12px' }}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button style={{ padding: '5px 10px', marginRight: '5px', border: 'none', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '5px', cursor: 'pointer' }}>✏️</button>
                    <button style={{ padding: '5px 10px', border: 'none', backgroundColor: user.isActive ? '#fef2f2' : '#f0fdf4', color: user.isActive ? '#ef4444' : '#22c55e', borderRadius: '5px', cursor: 'pointer' }}>
                      {user.isActive ? '🚫' : '✅'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

// Placeholder pages for other admin routes
const AttendancePage = () => (
  <AdminLayout>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>📅 Attendance Reports</h1>
    <p style={{ color: '#666', marginBottom: '30px' }}>Track and manage employee attendance</p>
    <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '48px', marginBottom: '20px' }}>📅</p>
      <p style={{ color: '#666' }}>Attendance data will appear here</p>
    </div>
  </AdminLayout>
);

const GeoLogsPage = () => (
  <AdminLayout>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>📍 Geo-Location Logs</h1>
    <p style={{ color: '#666', marginBottom: '30px' }}>Track check-in/check-out locations</p>
    <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '48px', marginBottom: '20px' }}>📍</p>
      <p style={{ color: '#666' }}>Geo-location data will appear here</p>
    </div>
  </AdminLayout>
);

const ReportsPage = () => (
  <AdminLayout>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>📝 Work Reports</h1>
    <p style={{ color: '#666', marginBottom: '30px' }}>Review employee daily work reports</p>
    <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '48px', marginBottom: '20px' }}>📝</p>
      <p style={{ color: '#666' }}>Work reports will appear here</p>
    </div>
  </AdminLayout>
);

const ExportPage = () => (
  <AdminLayout>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>📤 Export Center</h1>
    <p style={{ color: '#666', marginBottom: '30px' }}>Export data to Excel or PDF</p>
    <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '48px', marginBottom: '20px' }}>📤</p>
      <p style={{ color: '#666' }}>Export options will appear here</p>
    </div>
  </AdminLayout>
);

const SettingsPage = () => (
  <AdminLayout>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>⚙️ Settings</h1>
    <p style={{ color: '#666', marginBottom: '30px' }}>Manage company settings</p>
    <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: '48px', marginBottom: '20px' }}>⚙️</p>
      <p style={{ color: '#666' }}>Settings options will appear here</p>
    </div>
  </AdminLayout>
);

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
  
  console.log('ProtectedRoute check:', { token: !!token, role: user.role, allowedRoles });
  
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
  console.log('App rendering...');
  
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
        <Route path="/admin/export" element={<ProtectedRoute allowedRoles={['ADMIN']}><ExportPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        
        {/* Other Role Dashboards */}
        <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR']}><PlaceholderDashboard /></ProtectedRoute>} />
        <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><PlaceholderDashboard /></ProtectedRoute>} />
        <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><PlaceholderDashboard /></ProtectedRoute>} />
        <Route path="/intern/dashboard" element={<ProtectedRoute allowedRoles={['INTERN']}><PlaceholderDashboard /></ProtectedRoute>} />
        
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;