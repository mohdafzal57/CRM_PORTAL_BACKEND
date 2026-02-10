import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Button, Badge, Loading } from '../../components/admin/ui';
import * as api from '../../services/adminApi';

const WorkReports = () => {
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
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
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="SUBMITTED">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button variant="secondary" onClick={fetchReports}>
            🔄 Refresh
          </Button>
        </div>
      </Card>

      {/* Reports Table */}
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Tasks
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
                {reports.map((report) => (
                  <tr key={report._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{report.user?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{report.tasks?.length || 0} tasks</td>
                    <td className="py-3 px-4">{report.totalHoursWorked || 0}h</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(report.status)}>
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
};

export default WorkReports;