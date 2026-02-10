import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import KPICard from '../../components/KPICard';
import * as api from '../../services/adminApi';
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  TrendingUp,
  Shield,
  Activity,
  Clock
} from 'lucide-react';
// Recharts removed
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-[900] text-slate-800 tracking-tight">
              Admin <span className="text-indigo-600">Console.</span>
            </h1>
            <div className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px] font-black">
              System Overview • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Employees"
            value={stats?.counts?.totalEmployees || 0}
            icon={Users}
            trend="+12%"
            trendType="up"
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <KPICard
            title="Active Users"
            value={stats?.counts?.activeUsers || 0}
            icon={UserCheck}
            trend="+5%"
            trendType="up"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <KPICard
            title="Pending Reports"
            value={stats?.pendingReports || 0}
            icon={FileText}
            trend={stats?.pendingReports > 0 ? "Action Needed" : "All Clear"}
            trendType={stats?.pendingReports > 0 ? "down" : "up"}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <KPICard
            title="System Status"
            value="99.9%"
            icon={Activity}
            trend="Stable"
            trendType="up"
            iconColor="text-cyan-600"
            iconBg="bg-cyan-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Today's Attendance Snapshot */}
          <div className="glass-layer p-10 bg-indigo-600/5 border-indigo-200/20">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-[900] text-slate-800 tracking-tight uppercase tracking-widest text-xs">Today's Attendance</h3>
              <Clock className="w-6 h-6 text-indigo-600 opacity-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/60 rounded-2xl border border-white hover:border-indigo-100 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">Present</div>
                </div>
                <div className="text-2xl font-[900] text-slate-800">{stats?.todayAttendance?.present || 0}</div>
              </div>

              <div className="p-4 bg-white/60 rounded-2xl border border-white hover:border-indigo-100 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">Absent</div>
                </div>
                <div className="text-2xl font-[900] text-slate-800">{stats?.todayAttendance?.absent || 0}</div>
              </div>

              <div className="p-4 bg-white/60 rounded-2xl border border-white hover:border-indigo-100 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">Late</div>
                </div>
                <div className="text-2xl font-[900] text-slate-800">{stats?.todayAttendance?.late || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="glass-layer p-10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-[900] text-slate-800 tracking-tight">Recent Registrations</h3>
            <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentUsers?.map((user) => (
                  <tr key={user._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {(user.name || user.fullName || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{user.name || user.fullName}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-indigo-100">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className={`text-xs font-bold ${user.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {user.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Edit</button>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 text-sm">No recent users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;