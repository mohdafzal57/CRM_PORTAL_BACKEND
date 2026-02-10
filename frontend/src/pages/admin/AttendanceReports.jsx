import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Button, Badge, Loading } from '../../components/admin/ui';
import * as api from '../../services/adminApi';

const AttendanceReports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const formatTime = (time) => {
    return time ? new Date(time).toLocaleTimeString() : '-';
  };

  const formatWorkHours = (minutes) => {
    if (!minutes) return '-';
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <AdminLayout>
      {/* Header */}
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
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          <input
            type="date"
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
          <Button variant="secondary" onClick={fetchAttendance}>
            🔄 Refresh
          </Button>
        </div>
      </Card>

      {/* Records Table */}
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Check In
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Check Out
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Hours
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{record.user?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{formatTime(record.checkIn?.time)}</td>
                    <td className="py-3 px-4">{formatTime(record.checkOut?.time)}</td>
                    <td className="py-3 px-4">{formatWorkHours(record.workHours)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(record.status)}>
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
};

export default AttendanceReports;