// src/pages/admin/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import * as api from '../../services/adminApi';

// ==================== REUSABLE COMPONENTS ====================

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled, loading, className = '' }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading ? '⏳ Loading...' : children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      {...props}
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-4xl mb-4">⏳</div>
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ==================== DASHBOARD ====================

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboardStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout><Loading /></AdminLayout>;

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardStats}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.counts?.totalEmployees || 0}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats?.counts?.activeUsers || 0}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disabled Users</p>
              <p className="text-3xl font-bold text-red-600">{stats?.counts?.disabledUsers || 0}</p>
            </div>
            <div className="text-4xl">🚫</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.pendingReports || 0}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </Card>
      </div>

      {/* Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Today's Attendance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats?.todayAttendance?.present || 0}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats?.todayAttendance?.absent || 0}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-500">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.todayAttendance?.late || 0}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">On Leave</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.todayAttendance?.onLeave || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/users" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="text-2xl mb-2">➕</div>
              <span className="font-medium text-blue-600">Add Employee</span>
            </a>
            <a href="/admin/reports" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <span className="font-medium text-green-600">View Reports</span>
            </a>
            <a href="/admin/export" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <div className="text-2xl mb-2">📤</div>
              <span className="font-medium text-purple-600">Export Data</span>
            </a>
            <a href="/admin/settings" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <span className="font-medium text-gray-600">Settings</span>
            </a>
          </div>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 Recent Users</h2>
        {stats?.recentUsers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name || user.fullName}</td>
                    <td className="py-3 px-4 text-gray-500">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent users found</p>
        )}
      </Card>
    </AdminLayout>
  );
}

// ==================== USER MANAGEMENT ====================

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', role: 'EMPLOYEE', mobile: '', department: '', designation: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getUsers({ page, limit: 10, ...filters });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        await api.updateUser(editingUser._id, formData);
      } else {
        await api.createUser(formData);
      }
      setModalOpen(false);
      resetForm();
      fetchUsers(pagination.current);
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.join(', ')
        : (err.response?.data?.message || 'Error saving user');
      alert(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'disable' : 'enable'} this user?`)) {
      return;
    }
    try {
      await api.toggleUserStatus(user._id);
      fetchUsers(pagination.current);
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE ${user.name || user.fullName}? This action cannot be undone.`)) {
      return;
    }
    try {
      setLoading(true);
      await api.deleteUser(user._id);
      fetchUsers(pagination.current);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || user.name || '',
      email: user.email,
      role: user.role,
      mobile: user.mobile || '',
      department: user.department || '',
      designation: user.designation || ''
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      fullName: '', email: '', password: '', role: 'EMPLOYEE', mobile: '', department: '', designation: ''
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage employees, interns, and staff</p>
        </div>
        <Button onClick={() => { resetForm(); setModalOpen(true); }}>
          ➕ Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 Search by name or email..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="HR">HR</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="INTERN">Intern</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <Button variant="secondary" onClick={() => fetchUsers(1)}>
            🔄 Refresh
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <Loading />
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="info">{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{user.department || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => toggleStatus(user)}
                            className={`p-2 rounded-lg ${user.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                            title={user.isActive ? 'Disable' : 'Enable'}
                          >
                            {user.isActive ? '🚫' : '✅'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                Page {pagination.current} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => fetchUsers(pagination.current - 1)}
                  disabled={pagination.current <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fetchUsers(pagination.current + 1)}
                  disabled={pagination.current >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name *"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!editingUser}
          />
          {!editingUser && (
            <Input
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <Select
            label="Role *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'EMPLOYEE', label: 'Employee' },
              { value: 'HR', label: 'HR' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'INTERN', label: 'Intern' }
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          <Input
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

// ==================== ATTENDANCE REPORTS ====================

export function AttendanceReports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('daily');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });

  useEffect(() => {
    fetchAttendance();
  }, [filters, view]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.getAttendance({ ...filters });
      setRecords(response.data.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
        <p className="text-gray-500 mt-1">Track and manage employee attendance</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="date"
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <input
            type="date"
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
          <Button variant="secondary" onClick={fetchAttendance}>🔄 Refresh</Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <Loading />
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500">No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check In</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check Out</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{record.user?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {record.workHours ? `${Math.floor(record.workHours / 60)}h ${record.workHours % 60}m` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        record.status === 'PRESENT' ? 'success' :
                          record.status === 'ABSENT' ? 'danger' : 'warning'
                      }>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}

// ==================== GEO-LOCATION LOGS ====================

export function GeoLocationLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeoLogs();
  }, []);

  const fetchGeoLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getGeoLogs({});
      setLogs(response.data.data);
    } catch (err) {
      console.error('Error fetching geo logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Geo-Location Logs</h1>
        <p className="text-gray-500 mt-1">Track check-in/check-out locations</p>
      </div>

      <Card>
        {loading ? (
          <Loading />
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-gray-500">No geo-location logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check-In Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">In Office</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{log.user?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {log.checkIn?.location?.latitude ? (
                        <span className="text-sm">
                          📍 {log.checkIn.location.latitude.toFixed(4)}, {log.checkIn.location.longitude.toFixed(4)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={log.checkIn?.isWithinOffice ? 'success' : 'danger'}>
                        {log.checkIn?.isWithinOffice ? '✅ Yes' : '❌ No'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}

// ==================== WORK REPORTS ====================

export function WorkReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getWorkReports({ ...filters });
      setReports(response.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Work Reports</h1>
        <p className="text-gray-500 mt-1">Review employee daily work reports</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="SUBMITTED">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button variant="secondary" onClick={fetchReports}>🔄 Refresh</Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <Loading />
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500">No work reports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tasks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{report.user?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">{new Date(report.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{report.tasks?.length || 0} tasks</td>
                    <td className="py-3 px-4">{report.totalHoursWorked || 0}h</td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        report.status === 'APPROVED' ? 'success' :
                          report.status === 'REJECTED' ? 'danger' : 'warning'
                      }>
                        {report.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}

// ==================== EXPORT CENTER ====================

export function ExportCenter() {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('users');
  const [exportFormat, setExportFormat] = useState('excel');

  const handleExport = async () => {
    setLoading(true);
    try {
      await api.exportData(exportType, exportFormat);
      alert('Export started! File will download shortly.');
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Export Center</h1>
        <p className="text-gray-500 mt-1">Export data to Excel or PDF</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-6">📤 Export Configuration</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Data Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'users', label: 'Employees', icon: '👥' },
                { value: 'attendance', label: 'Attendance', icon: '📅' },
                { value: 'reports', label: 'Work Reports', icon: '📝' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setExportType(item.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${exportType === item.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Format</label>
            <div className="flex gap-4">
              {[
                { value: 'excel', label: 'Excel (.xlsx)' },
                { value: 'pdf', label: 'PDF (.pdf)' }
              ].map((item) => (
                <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={item.value}
                    checked={exportFormat === item.value}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} loading={loading} className="w-full">
            📤 Export Data
          </Button>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-6">⚡ Quick Export</h2>
          <div className="space-y-4">
            <button
              onClick={() => api.exportData('users', 'excel')}
              className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left flex items-center justify-between"
            >
              <span className="font-medium text-green-700">All Employees (Excel)</span>
              <span>📤</span>
            </button>
            <button
              onClick={() => api.exportData('attendance', 'excel')}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left flex items-center justify-between"
            >
              <span className="font-medium text-blue-700">Attendance Report (Excel)</span>
              <span>📤</span>
            </button>
            <button
              onClick={() => api.exportData('reports', 'pdf')}
              className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left flex items-center justify-between"
            >
              <span className="font-medium text-purple-700">Work Reports (PDF)</span>
              <span>📤</span>
            </button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ==================== SETTINGS PAGE ====================

export function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSettings();
      setSettings(response.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><Loading /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage company settings and policies</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          💾 Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Office Location */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">📍 Office Location</h2>
          <Input
            label="Address"
            value={settings?.officeLocation?.address || ''}
            onChange={(e) => setSettings({
              ...settings,
              officeLocation: { ...settings?.officeLocation, address: e.target.value }
            })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              value={settings?.officeLocation?.latitude || ''}
              onChange={(e) => setSettings({
                ...settings,
                officeLocation: { ...settings?.officeLocation, latitude: parseFloat(e.target.value) }
              })}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              value={settings?.officeLocation?.longitude || ''}
              onChange={(e) => setSettings({
                ...settings,
                officeLocation: { ...settings?.officeLocation, longitude: parseFloat(e.target.value) }
              })}
            />
          </div>
          <Input
            label="Geofence Radius (km)"
            type="number"
            step="0.01"
            value={settings?.officeLocation?.radius || 0.1}
            onChange={(e) => setSettings({
              ...settings,
              officeLocation: { ...settings?.officeLocation, radius: parseFloat(e.target.value) }
            })}
          />
        </Card>

        {/* Working Hours */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">🕐 Working Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={settings?.workingHours?.start || '09:00'}
              onChange={(e) => setSettings({
                ...settings,
                workingHours: { ...settings?.workingHours, start: e.target.value }
              })}
            />
            <Input
              label="End Time"
              type="time"
              value={settings?.workingHours?.end || '18:00'}
              onChange={(e) => setSettings({
                ...settings,
                workingHours: { ...settings?.workingHours, end: e.target.value }
              })}
            />
          </div>
          <Select
            label="Timezone"
            value={settings?.timezone || 'UTC'}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            options={[
              { value: 'UTC', label: 'UTC' },
              { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
              { value: 'America/New_York', label: 'America/New_York (EST)' },
              { value: 'Europe/London', label: 'Europe/London (GMT)' }
            ]}
          />
        </Card>

        {/* Company Info */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">🏢 Company Information</h2>
          <Input
            label="Company Name"
            value={settings?.name || ''}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          />
          <Input
            label="Contact Email"
            type="email"
            value={settings?.contactEmail || ''}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
          />
          <Input
            label="Contact Phone"
            value={settings?.contactPhone || ''}
            onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
          />
        </Card>

        {/* Policies */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">📋 Policies</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Policy</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              rows="3"
              value={settings?.policies?.leave || ''}
              onChange={(e) => setSettings({
                ...settings,
                policies: { ...settings?.policies, leave: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Policy</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              rows="3"
              value={settings?.policies?.attendance || ''}
              onChange={(e) => setSettings({
                ...settings,
                policies: { ...settings?.policies, attendance: e.target.value }
              })}
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ==================== DEFAULT EXPORT ====================
export default {
  Dashboard,
  UserManagement,
  AttendanceReports,
  GeoLocationLogs,
  WorkReports,
  ExportCenter,
  SettingsPage
};