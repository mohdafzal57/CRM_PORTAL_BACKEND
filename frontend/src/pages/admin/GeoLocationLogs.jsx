import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Badge, Loading } from '../../components/admin/ui';
import * as api from '../../services/adminApi';

const GeoLocationLogs = () => {
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

  const formatCoordinates = (location) => {
    if (!location?.latitude) return '-';
    return `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Geo-Location Logs</h1>
        <p className="text-gray-500 mt-1">Track check-in/check-out locations</p>
      </div>

      {/* Logs Table */}
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Check-In Location
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    In Office
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{log.user?.fullName || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {formatCoordinates(log.checkIn?.location)}
                      </span>
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
};

export default GeoLocationLogs;