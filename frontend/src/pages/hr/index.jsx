import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HRLayout from '../../components/hr/HRLayout';
import { Card, Button, Badge, Loading, Modal, Input, Select } from '../../components/admin/ui';
import * as api from '../../services/hrApi';

// ==================== HR DASHBOARD ====================
export function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentActivity()
      ]);
      setStats(statsRes.data.data);
      setRecentActivity(activityRes.data.data || []);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <HRLayout><Loading /></HRLayout>;

  return (
    <HRLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's today's overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Present Today', value: stats?.todayAttendance?.present || 0, color: 'emerald', icon: '✅' },
          { label: 'Absent Today', value: stats?.todayAttendance?.absent || 0, color: 'red', icon: '❌' },
          { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, color: 'yellow', icon: '📋' },
          { label: 'Total Employees', value: stats?.totalEmployees || 0, color: 'blue', icon: '👥' }
        ].map((stat, idx) => (
          <Card key={idx} className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-${stat.color}-100 text-sm`}>{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="text-4xl opacity-80">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { to: '/hr/take-attendance', icon: '✅', label: 'Take Attendance', color: 'emerald' },
              { to: '/hr/leaves', icon: '🏖️', label: 'Leave Requests', color: 'yellow', badge: stats?.pendingLeaves },
              { to: '/hr/employees', icon: '👥', label: 'Employees', color: 'blue' },
              { to: '/hr/reports', icon: '📊', label: 'Reports', color: 'purple' }
            ].map((action, idx) => (
              <Link key={idx} to={action.to} className={`p-4 bg-${action.color}-50 rounded-xl hover:bg-${action.color}-100 transition-colors text-center border-2 border-${action.color}-200 relative`}>
                <div className="text-3xl mb-2">{action.icon}</div>
                <span className={`font-semibold text-${action.color}-700`}>{action.label}</span>
                {action.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">📅 Today's Attendance</h2>
          <div className="space-y-3">
            {[
              { label: 'Present', value: stats?.todayAttendance?.present || 0, color: 'emerald', icon: '✅' },
              { label: 'Absent', value: stats?.todayAttendance?.absent || 0, color: 'red', icon: '❌' },
              { label: 'Late', value: stats?.todayAttendance?.late || 0, color: 'yellow', icon: '⏰' },
              { label: 'On Leave', value: stats?.todayAttendance?.onLeave || 0, color: 'blue', icon: '🏖️' }
            ].map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 bg-${item.color}-50 rounded-lg`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">🕐 Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{activity.icon || '📌'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">🗓️ Upcoming Leaves</h2>
          {stats?.upcomingLeaves?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.upcomingLeaves.map((leave, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {leave.user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{leave.user?.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={leave.type === 'Sick' ? 'danger' : 'info'}>{leave.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming leaves</p>
          )}
        </Card>
      </div>
    </HRLayout>
  );
}

// ==================== TAKE ATTENDANCE ====================
export function TakeAttendance() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.getEmployeesForAttendance(selectedDate);
      const data = response.data.data;
      setEmployees(data.employees || []);
      setDepartments(data.departments || []);

      const initialData = {};
      data.employees?.forEach(emp => {
        initialData[emp._id] = {
          status: emp.attendance?.status || 'ABSENT',
          checkIn: emp.attendance?.checkIn?.time ? new Date(emp.attendance.checkIn.time).toTimeString().slice(0, 5) : '',
          checkOut: emp.attendance?.checkOut?.time ? new Date(emp.attendance.checkOut.time).toTimeString().slice(0, 5) : '',
          notes: emp.attendance?.notes || ''
        };
      });
      setAttendanceData(initialData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (empId, status) => {
    setAttendanceData(prev => ({ ...prev, [empId]: { ...prev[empId], status } }));
  };

  const handleTimeChange = (empId, field, value) => {
    setAttendanceData(prev => ({ ...prev, [empId]: { ...prev[empId], [field]: value } }));
  };

  const handleBulkStatus = (status) => {
    const newData = { ...attendanceData };
    filteredEmployees.forEach(emp => {
      newData[emp._id] = { ...newData[emp._id], status };
    });
    setAttendanceData(newData);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const records = Object.entries(attendanceData).map(([userId, data]) => ({
        userId,
        date: selectedDate,
        status: data.status,
        checkIn: data.checkIn ? { time: `${selectedDate}T${data.checkIn}` } : null,
        checkOut: data.checkOut ? { time: `${selectedDate}T${data.checkOut}` } : null,
        notes: data.notes
      }));
      await api.saveAttendance({ date: selectedDate, records });
      alert('✅ Attendance saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !filterDepartment || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const statusOptions = [
    { value: 'PRESENT', label: 'P', color: 'green', full: 'Present' },
    { value: 'ABSENT', label: 'A', color: 'red', full: 'Absent' },
    { value: 'LATE', label: 'L', color: 'yellow', full: 'Late' },
    { value: 'HALF_DAY', label: 'H', color: 'orange', full: 'Half Day' },
    { value: 'ON_LEAVE', label: 'OL', color: 'blue', full: 'On Leave' }
  ];

  const getStatusColor = (status) => {
    const opt = statusOptions.find(o => o.value === status);
    return opt ? `bg-${opt.color}-500` : 'bg-gray-500';
  };

  return (
    <HRLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Take Attendance</h1>
          <p className="text-gray-500 mt-1">Mark daily attendance for employees</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <Button onClick={handleSave} loading={saving} className="bg-emerald-500 hover:bg-emerald-600">
            💾 Save Attendance
          </Button>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="🔍 Search employees..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Mark All:</span>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleBulkStatus(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border-2 border-${opt.color}-400 text-${opt.color}-600 hover:bg-${opt.color}-50 font-medium`}
                title={opt.full}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {statusOptions.map(opt => {
          const count = Object.values(attendanceData).filter(d => d.status === opt.value).length;
          return (
            <Card key={opt.value} className={`bg-${opt.color}-50 border-2 border-${opt.color}-200`}>
              <div className="text-center">
                <p className={`text-2xl font-bold text-${opt.color}-600`}>{count}</p>
                <p className={`text-sm text-${opt.color}-600`}>{opt.full}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Attendance Table */}
      <Card>
        {loading ? <Loading /> : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Department</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Check In</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Check Out</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${getStatusColor(attendanceData[emp._id]?.status)} rounded-full flex items-center justify-center text-white font-bold`}>
                          {emp.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{emp.fullName}</p>
                          <p className="text-sm text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{emp.department || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1">
                        {statusOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(emp._id, opt.value)}
                            className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                              attendanceData[emp._id]?.status === opt.value
                                ? `bg-${opt.color}-500 text-white ring-2 ring-offset-2 ring-${opt.color}-500`
                                : `bg-${opt.color}-100 text-${opt.color}-600 hover:bg-${opt.color}-200`
                            }`}
                            title={opt.full}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        value={attendanceData[emp._id]?.checkIn || ''}
                        onChange={(e) => handleTimeChange(emp._id, 'checkIn', e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded text-sm w-24 mx-auto block"
                        disabled={['ABSENT', 'ON_LEAVE'].includes(attendanceData[emp._id]?.status)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        value={attendanceData[emp._id]?.checkOut || ''}
                        onChange={(e) => handleTimeChange(emp._id, 'checkOut', e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded text-sm w-24 mx-auto block"
                        disabled={['ABSENT', 'ON_LEAVE'].includes(attendanceData[emp._id]?.status)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={attendanceData[emp._id]?.notes || ''}
                        onChange={(e) => setAttendanceData(prev => ({
                          ...prev,
                          [emp._id]: { ...prev[emp._id], notes: e.target.value }
                        }))}
                        className="px-2 py-1 border border-gray-200 rounded text-sm w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-gray-500">Showing {filteredEmployees.length} of {employees.length} employees</p>
        <Button onClick={handleSave} loading={saving} className="bg-emerald-500 hover:bg-emerald-600 px-8">
          💾 Save All Attendance
        </Button>
      </div>
    </HRLayout>
  );
}

// ==================== ATTENDANCE RECORDS ====================
export function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', search: '' });
  const [editModal, setEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRecords(); }, [filters]);

  const fetchRecords = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getAttendanceRecords({ page, limit: 20, ...filters });
      setRecords(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setEditData({
      status: record.status,
      checkIn: record.checkIn?.time ? new Date(record.checkIn.time).toTimeString().slice(0, 5) : '',
      checkOut: record.checkOut?.time ? new Date(record.checkOut.time).toTimeString().slice(0, 5) : '',
      notes: record.notes || ''
    });
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await api.updateAttendanceRecord(selectedRecord._id, { ...editData, date: selectedRecord.date });
      alert('Updated successfully');
      setEditModal(false);
      fetchRecords(pagination.current);
    } catch (err) {
      alert('Error updating');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time) => time ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
  const formatWorkHours = (mins) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '-';

  return (
    <HRLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-500 mt-1">View and manage attendance history</p>
        </div>
        <Button variant="secondary" onClick={() => fetchRecords(1)}>🔄 Refresh</Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="🔍 Search..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <input type="date" className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <input type="date" className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <select className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? <Loading /> : records.length === 0 ? (
          <div className="text-center py-12"><div className="text-6xl mb-4">📅</div><p className="text-gray-500">No records found</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Check In</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Check Out</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Hours</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            {record.user?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{record.user?.fullName || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{record.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'danger' : 'warning'}>{record.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">{formatTime(record.checkIn?.time)}</td>
                      <td className="py-3 px-4 text-center">{formatTime(record.checkOut?.time)}</td>
                      <td className="py-3 px-4 text-center">{formatWorkHours(record.workHours)}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => openEditModal(record)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Page {pagination.current} of {pagination.pages}</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => fetchRecords(pagination.current - 1)} disabled={pagination.current <= 1}>Previous</Button>
                <Button variant="secondary" onClick={() => fetchRecords(pagination.current + 1)} disabled={pagination.current >= pagination.pages}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Attendance">
        {selectedRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">{selectedRecord.user?.fullName}</p>
              <p className="text-sm text-gray-500">{new Date(selectedRecord.date).toLocaleDateString()}</p>
            </div>
            <Select label="Status" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              options={[
                { value: 'PRESENT', label: 'Present' },
                { value: 'ABSENT', label: 'Absent' },
                { value: 'LATE', label: 'Late' },
                { value: 'HALF_DAY', label: 'Half Day' },
                { value: 'ON_LEAVE', label: 'On Leave' }
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Check In" type="time" value={editData.checkIn} onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })} />
              <Input label="Check Out" type="time" value={editData.checkOut} onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg" rows="2" value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </HRLayout>
  );
}

// ==================== EMPLOYEE DIRECTORY ====================
export function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', department: '', role: '' });
  const [departments, setDepartments] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => { fetchEmployees(); }, [filters]);

  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getEmployees({ page, limit: 12, ...filters });
      setEmployees(response.data.data);
      setPagination(response.data.pagination);
      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = async (emp) => {
    try {
      const response = await api.getEmployeeDetails(emp._id);
      setSelectedEmployee(response.data.data);
      setViewModal(true);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <HRLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-500 mt-1">Browse and view employee information</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <input type="text" placeholder="🔍 Search..." className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <select className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All Roles</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="INTERN">Intern</option>
          </select>
        </div>
      </Card>

      {/* Grid */}
      {loading ? <Loading /> : employees.length === 0 ? (
        <Card><div className="text-center py-12"><div className="text-6xl mb-4">👥</div><p className="text-gray-500">No employees found</p></div></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((emp) => (
              <Card key={emp._id} className="hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {emp.fullName?.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{emp.fullName}</h3>
                  <p className="text-sm text-gray-500 mb-2">{emp.designation || emp.role}</p>
                  <Badge variant={emp.role === 'MANAGER' ? 'warning' : emp.role === 'INTERN' ? 'default' : 'info'}>{emp.role}</Badge>
                  <p className="text-sm text-gray-500 mt-3">📍 {emp.department || 'No Department'}</p>
                  <div className="mt-4 space-y-1 text-sm">
                    <p className="text-gray-600">📧 {emp.email}</p>
                    {emp.mobile && <p className="text-gray-600">📱 {emp.mobile}</p>}
                  </div>
                  <div className="mt-4">
                    <Badge variant={emp.isActive ? 'success' : 'danger'}>{emp.isActive ? '🟢 Active' : '🔴 Inactive'}</Badge>
                  </div>
                  <button onClick={() => openViewModal(emp)} className="mt-4 w-full px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium">
                    View Profile
                  </button>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-500">Showing {employees.length} of {pagination.total}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => fetchEmployees(pagination.current - 1)} disabled={pagination.current <= 1}>Previous</Button>
              <Button variant="secondary" onClick={() => fetchEmployees(pagination.current + 1)} disabled={pagination.current >= pagination.pages}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Employee Profile" size="lg">
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedEmployee.fullName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedEmployee.fullName}</h2>
                <p className="text-gray-600">{selectedEmployee.designation || selectedEmployee.role}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="info">{selectedEmployee.role}</Badge>
                  <Badge variant={selectedEmployee.isActive ? 'success' : 'danger'}>{selectedEmployee.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Email', value: selectedEmployee.email },
                { label: 'Phone', value: selectedEmployee.mobile || '-' },
                { label: 'Department', value: selectedEmployee.department || '-' },
                { label: 'Designation', value: selectedEmployee.designation || '-' },
                { label: 'Joined', value: selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : '-' },
                { label: 'Employee ID', value: selectedEmployee._id?.slice(-8) }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            {selectedEmployee.attendanceSummary && (
              <div>
                <h3 className="font-semibold mb-3">📊 This Month's Attendance</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Present', value: selectedEmployee.attendanceSummary.present, color: 'green' },
                    { label: 'Absent', value: selectedEmployee.attendanceSummary.absent, color: 'red' },
                    { label: 'Late', value: selectedEmployee.attendanceSummary.late, color: 'yellow' },
                    { label: 'Leaves', value: selectedEmployee.attendanceSummary.leaves, color: 'blue' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-3 bg-${item.color}-50 rounded-lg text-center`}>
                      <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value || 0}</p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </HRLayout>
  );
}

// ==================== LEAVE MANAGEMENT ====================
export function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewData, setReviewData] = useState({ status: '', comments: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchLeaves(); }, [filters, activeTab]);

  const fetchLeaves = async (page = 1) => {
    try {
      setLoading(true);
      const statusMap = { pending: 'PENDING', approved: 'APPROVED', rejected: 'REJECTED', all: '' };
      const response = await api.getLeaveRequests({ page, limit: 10, status: statusMap[activeTab], ...filters });
      setLeaves(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewData.status) { alert('Select a status'); return; }
    try {
      setProcessing(true);
      await api.reviewLeave(selectedLeave._id, reviewData);
      alert(`Leave ${reviewData.status.toLowerCase()}`);
      setReviewModal(false);
      fetchLeaves(pagination.current);
    } catch (err) {
      alert('Error processing request');
    } finally {
      setProcessing(false);
    }
  };

  const calcDays = (start, end) => Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

  const tabs = [
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'approved', label: 'Approved', icon: '✅' },
    { id: 'rejected', label: 'Rejected', icon: '❌' },
    { id: 'all', label: 'All', icon: '📋' }
  ];

  return (
    <HRLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-500 mt-1">Review and manage leave requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
            <span className="mr-2">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <input type="text" placeholder="🔍 Search..." className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <select className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            {['Annual', 'Sick', 'Casual', 'Unpaid', 'Maternity', 'Paternity'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      {/* Leave Cards */}
      <Card>
        {loading ? <Loading /> : leaves.length === 0 ? (
          <div className="text-center py-12"><div className="text-6xl mb-4">🏖️</div><p className="text-gray-500">No leave requests found</p></div>
        ) : (
          <>
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {leave.user?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{leave.user?.fullName}</h3>
                        <p className="text-sm text-gray-500">{leave.user?.department}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-center"><p className="text-xs text-gray-500">Type</p><Badge variant={leave.type === 'Sick' ? 'danger' : 'info'}>{leave.type}</Badge></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Duration</p><p className="font-semibold">{calcDays(leave.startDate, leave.endDate)} days</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Period</p><p className="text-sm">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Status</p><Badge variant={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}>{leave.status}</Badge></div>
                    </div>
                    {leave.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button variant="success" onClick={() => { setSelectedLeave(leave); setReviewData({ status: 'APPROVED', comments: '' }); setReviewModal(true); }}>✓ Approve</Button>
                        <Button variant="danger" onClick={() => { setSelectedLeave(leave); setReviewData({ status: 'REJECTED', comments: '' }); setReviewModal(true); }}>✗ Reject</Button>
                      </div>
                    )}
                  </div>
                  {leave.reason && <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm"><span className="font-medium">Reason:</span> {leave.reason}</div>}
                  {leave.reviewComments && <div className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800"><span className="font-medium">HR Comments:</span> {leave.reviewComments}</div>}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <span className="text-sm text-gray-500">Page {pagination.current} of {pagination.pages}</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => fetchLeaves(pagination.current - 1)} disabled={pagination.current <= 1}>Previous</Button>
                <Button variant="secondary" onClick={() => fetchLeaves(pagination.current + 1)} disabled={pagination.current >= pagination.pages}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Review Leave Request">
        {selectedLeave && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">{selectedLeave.user?.fullName?.charAt(0)}</div>
                <div><p className="font-semibold">{selectedLeave.user?.fullName}</p><p className="text-sm text-gray-500">{selectedLeave.user?.department}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-gray-500">Type:</span> {selectedLeave.type}</p>
                <p><span className="text-gray-500">Days:</span> {calcDays(selectedLeave.startDate, selectedLeave.endDate)}</p>
                <p><span className="text-gray-500">From:</span> {new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                <p><span className="text-gray-500">To:</span> {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
              </div>
              {selectedLeave.reason && <p className="mt-2 text-sm"><span className="text-gray-500">Reason:</span> {selectedLeave.reason}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Decision</label>
              <div className="flex gap-4">
                <button onClick={() => setReviewData({ ...reviewData, status: 'APPROVED' })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${reviewData.status === 'APPROVED' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                  <div className="text-2xl mb-1">✅</div><span className="font-medium text-green-700">Approve</span>
                </button>
                <button onClick={() => setReviewData({ ...reviewData, status: 'REJECTED' })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${reviewData.status === 'REJECTED' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}>
                  <div className="text-2xl mb-1">❌</div><span className="font-medium text-red-700">Reject</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg" rows="2" placeholder="Add comments..." value={reviewData.comments} onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setReviewModal(false)}>Cancel</Button>
              <Button onClick={handleReview} loading={processing} variant={reviewData.status === 'APPROVED' ? 'success' : 'danger'}>
                {reviewData.status === 'APPROVED' ? 'Approve' : 'Reject'} Leave
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </HRLayout>
  );
}

// ==================== INTERN MANAGEMENT ====================
export function InternManagement() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '' });
  const [detailModal, setDetailModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [taskModal, setTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });

  useEffect(() => { fetchInterns(); }, [filters]);

  const fetchInterns = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getInterns({ page, limit: 12, ...filters });
      setInterns(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (intern) => {
    try {
      const response = await api.getInternDetails(intern.userId?._id || intern._id);
      setSelectedIntern(response.data.data);
      setDetailModal(true);
    } catch (err) {
      alert('Error fetching details');
    }
  };

  const handleAssignTask = async () => {
    if (!newTask.title) { alert('Title required'); return; }
    try {
      await api.assignTask(selectedIntern.userId._id, newTask);
      alert('Task assigned!');
      setNewTask({ title: '', description: '', dueDate: '' });
      setTaskModal(false);
      const res = await api.getInternDetails(selectedIntern.userId._id);
      setSelectedIntern(res.data.data);
    } catch (err) {
      alert('Error assigning task');
    }
  };

  const calcProgress = (start, end) => {
    if (!start || !end) return 0;
    const total = new Date(end) - new Date(start);
    const elapsed = new Date() - new Date(start);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  return (
    <HRLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Intern Management</h1>
        <p className="text-gray-500 mt-1">Manage and track interns</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <input type="text" placeholder="🔍 Search interns..." className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <Button variant="secondary" onClick={() => fetchInterns(1)}>🔄 Refresh</Button>
        </div>
      </Card>

      {/* Interns Grid */}
      {loading ? <Loading /> : interns.length === 0 ? (
        <Card><div className="text-center py-12"><div className="text-6xl mb-4">🎓</div><p className="text-gray-500">No interns found</p></div></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interns.map((intern) => (
              <Card key={intern._id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {intern.userId?.fullName?.charAt(0) || 'I'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{intern.userId?.fullName}</h3>
                      <p className="text-sm text-gray-500">{intern.internId}</p>
                    </div>
                  </div>
                  <Badge variant={intern.userId?.isActive ? 'success' : 'danger'}>{intern.userId?.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Domain:</span><span className="font-medium">{intern.internship?.domain || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium">{intern.internship?.type || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Mentor:</span><span className="font-medium">{intern.internship?.assignedMentor || '-'}</span></div>
                </div>
                {intern.internship?.startDate && intern.internship?.endDate && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{calcProgress(intern.internship.startDate, intern.internship.endDate)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${calcProgress(intern.internship.startDate, intern.internship.endDate)}%` }} />
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openDetail(intern)} className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-medium">View Details</button>
                  <button onClick={() => { setSelectedIntern(intern); setTaskModal(true); }} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">Assign Task</button>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-500">Showing {interns.length} of {pagination.total}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => fetchInterns(pagination.current - 1)} disabled={pagination.current <= 1}>Previous</Button>
              <Button variant="secondary" onClick={() => fetchInterns(pagination.current + 1)} disabled={pagination.current >= pagination.pages}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Intern Profile" size="lg">
        {selectedIntern && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedIntern.userId?.fullName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedIntern.userId?.fullName}</h2>
                <p className="text-gray-500">{selectedIntern.internId}</p>
                <p className="text-sm text-gray-500">{selectedIntern.userId?.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🏢 Internship Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Domain', value: selectedIntern.internship?.domain },
                  { label: 'Type', value: selectedIntern.internship?.type },
                  { label: 'Mentor', value: selectedIntern.internship?.assignedMentor },
                  { label: 'Batch', value: selectedIntern.internship?.assignedBatch },
                  { label: 'Start Date', value: selectedIntern.internship?.startDate ? new Date(selectedIntern.internship.startDate).toLocaleDateString() : '-' },
                  { label: 'End Date', value: selectedIntern.internship?.endDate ? new Date(selectedIntern.internship.endDate).toLocaleDateString() : '-' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">{item.label}</p><p className="font-medium">{item.value || '-'}</p></div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🎓 Education</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'College', value: selectedIntern.education?.collegeName },
                  { label: 'Course', value: selectedIntern.education?.course },
                  { label: 'Branch', value: selectedIntern.education?.branch },
                  { label: 'Year/Semester', value: selectedIntern.education?.yearSemester }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">{item.label}</p><p className="font-medium">{item.value || '-'}</p></div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">📋 Assigned Tasks ({selectedIntern.assignedTasks?.length || 0})</h3>
              {selectedIntern.assignedTasks?.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedIntern.assignedTasks.slice().reverse().map((task, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div><p className="font-medium">{task.title}</p><p className="text-sm text-gray-500">{task.description}</p></div>
                      <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'default'}>{task.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">No tasks assigned</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* Task Modal */}
      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="Assign Task">
        <div className="space-y-4">
          <Input label="Task Title *" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Enter task title" />
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg" rows="3" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Description..." /></div>
          <Input label="Due Date" type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setTaskModal(false)}>Cancel</Button>
            <Button onClick={handleAssignTask}>Assign Task</Button>
          </div>
        </div>
      </Modal>
    </HRLayout>
  );
}

// ==================== REPORTS ====================
export function HRReports() {
  const [activeReport, setActiveReport] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchReport(); }, [activeReport, filters]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.getReport(activeReport, filters);
      setReportData(response.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await api.exportReport(activeReport, format, filters);
      alert('Report exported!');
    } catch (err) {
      alert('Export failed');
    }
  };

  const reportTypes = [
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'leave', label: 'Leave', icon: '🏖️' },
    { id: 'employee', label: 'Employee', icon: '👥' },
    { id: 'intern', label: 'Intern', icon: '🎓' }
  ];

  return (
    <HRLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export HR reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExport('excel')}>📊 Excel</Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>📄 PDF</Button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {reportTypes.map((r) => (
          <button key={r.id} onClick={() => setActiveReport(r.id)}
            className={`p-4 rounded-xl border-2 transition-all ${activeReport === r.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
            <div className="text-3xl mb-2">{r.icon}</div>
            <span className="font-medium">{r.label} Report</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div><label className="block text-sm text-gray-500 mb-1">Start Date</label><input type="date" className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-500 mb-1">End Date</label><input type="date" className="px-4 py-2 border border-gray-200 rounded-lg" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} /></div>
          <div className="flex items-end"><Button onClick={fetchReport}>🔄 Generate</Button></div>
        </div>
      </Card>

      {/* Report Data */}
      <Card>
        {loading ? <Loading /> : !reportData ? (
          <div className="text-center py-12"><div className="text-6xl mb-4">📊</div><p className="text-gray-500">Generate a report</p></div>
        ) : (
          <div>
            {reportData.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  </div>
                ))}
              </div>
            )}
            {reportData.records?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {Object.keys(reportData.records[0]).map((key) => (
                        <th key={key} className="text-left py-3 px-4 text-sm font-semibold text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.records.map((record, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        {Object.values(record).map((value, i) => (
                          <td key={i} className="py-3 px-4 text-sm">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value || '-')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>
    </HRLayout>
  );
}

// ==================== MY PROFILE ====================
export function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getMyProfile();
      setProfile(response.data.data);
      setFormData(response.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateMyProfile(formData);
      setProfile(formData);
      setEditing(false);
      alert('Profile updated!');
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) { alert('Passwords do not match'); return; }
    if (passwordData.newPassword.length < 6) { alert('Password min 6 characters'); return; }
    try {
      setChangingPassword(true);
      await api.changePassword(passwordData);
      alert('Password changed!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <HRLayout><Loading /></HRLayout>;

  return (
    <HRLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            {!editing ? (
              <Button onClick={() => setEditing(true)}>✏️ Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setEditing(false); setFormData(profile); }}>Cancel</Button>
                <Button onClick={handleSave} loading={saving}>💾 Save</Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 mb-6 pb-6 border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile?.fullName?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{profile?.fullName}</h3>
              <p className="text-gray-500">{profile?.role}</p>
              <p className="text-sm text-gray-400">{profile?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={!editing} />
            <Input label="Email" value={formData.email || ''} disabled />
            <Input label="Phone" value={formData.mobile || ''} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} disabled={!editing} />
            <Input label="Department" value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} disabled={!editing} />
            <Input label="Designation" value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} disabled={!editing} />
            <Input label="Employee ID" value={profile?._id?.slice(-8) || '-'} disabled />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">🔐 Change Password</h2>
            <div className="space-y-4">
              <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
              <Input label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
              <Input label="Confirm Password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
              <Button onClick={handleChangePassword} loading={changingPassword} className="w-full">Change Password</Button>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold mb-4">📋 Account Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium">{profile?.role}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-medium ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>{profile?.isActive ? 'Active' : 'Inactive'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </HRLayout>
  );
}

// ==================== DEFAULT EXPORT ====================
export default {
  HRDashboard,
  TakeAttendance,
  AttendanceRecords,
  EmployeeDirectory,
  LeaveManagement,
  InternManagement,
  HRReports,
  MyProfile
};