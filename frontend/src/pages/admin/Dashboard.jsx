import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Button, Badge, Loading } from '../../components/admin/ui';
import * as api from '../../services/adminApi';

const Dashboard = () => {
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

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardStats}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.counts?.totalEmployees || 0}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.counts?.activeUsers || 0}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disabled Users</p>
              <p className="text-3xl font-bold text-red-600">
                {stats?.counts?.disabledUsers || 0}
              </p>
            </div>
            <div className="text-4xl">🚫</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats?.pendingReports || 0}
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </Card>
      </div>

      {/* Today's Attendance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📅 Today's Attendance
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.todayAttendance?.present || 0}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">
                {stats?.todayAttendance?.absent || 0}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-500">Late</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.todayAttendance?.late || 0}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">On Leave</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.todayAttendance?.onLeave || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <span className="font-medium text-blue-600">Add Employee</span>
            </a>
            <a
              href="/admin/reports"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <span className="font-medium text-green-600">View Reports</span>
            </a>
            <a
              href="/admin/export"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📤</div>
              <span className="font-medium text-purple-600">Export Data</span>
            </a>
            <a
              href="/admin/settings"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <span className="font-medium text-gray-600">Settings</span>
            </a>
          </div>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          👥 Recent Users
        </h2>
        {stats?.recentUsers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
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
};

export default Dashboard;