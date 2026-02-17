import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Button, Badge, Loading, Modal, Input, Select } from '../../components/admin/ui';
import * as api from '../../services/adminApi';

const GeoLocationLogs = () => {
  // State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
    withinOffice: '',
    department: ''
  });
  const [departments, setDepartments] = useState([]);
  
  // Modals
  const [detailModal, setDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [mapModal, setMapModal] = useState(false);

  useEffect(() => {
    fetchGeoLogs();
    fetchStats();
  }, [filters]);

  const fetchGeoLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getGeoLogs({ page, limit: 15, ...filters });
      setLogs(response.data.data);
      setPagination(response.data.pagination);
      if (response.data.departments) {
        setDepartments(response.data.departments);
      }
    } catch (err) {
      console.error('Error fetching geo logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getGeoStats(filters);
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      search: '',
      withinOffice: '',
      department: ''
    });
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setDetailModal(true);
  };

  const openMapView = (log) => {
    setSelectedLog(log);
    setMapModal(true);
  };

  const formatCoordinates = (location) => {
    if (!location?.latitude) return '-';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };

  const exportLogs = async () => {
    try {
      await api.exportGeoLogs(filters);
      alert('Export started! File will download shortly.');
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📍 Geo-Location Logs</h1>
          <p className="text-gray-500 mt-1">Track employee check-in/check-out locations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => fetchGeoLogs(1)}>
            🔄 Refresh
          </Button>
          <Button onClick={exportLogs} className="bg-blue-500 hover:bg-blue-600 text-white">
            📤 Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Check-ins</p>
              <p className="text-3xl font-bold">{stats?.totalCheckIns || 0}</p>
            </div>
            <div className="text-4xl opacity-80">📍</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Within Office</p>
              <p className="text-3xl font-bold">{stats?.withinOffice || 0}</p>
            </div>
            <div className="text-4xl opacity-80">🏢</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Outside Office</p>
              <p className="text-3xl font-bold">{stats?.outsideOffice || 0}</p>
            </div>
            <div className="text-4xl opacity-80">🌍</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Remote Workers</p>
              <p className="text-3xl font-bold">{stats?.remoteWorkers || 0}</p>
            </div>
            <div className="text-4xl opacity-80">🏠</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-l-4 border-blue-500">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
            <input
              type="text"
              placeholder="🔍 Name or email..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.withinOffice}
              onChange={(e) => handleFilterChange('withinOffice', e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="true">Within Office</option>
              <option value="false">Outside Office</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <Button variant="secondary" onClick={clearFilters}>
            ✕ Clear
          </Button>
        </div>
      </Card>

      {/* Quick Stats Bar */}
      {stats?.todayStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">📊 Today's Summary</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm text-gray-500">Checked In</p>
                <p className="font-bold text-blue-600">{stats.todayStats.checkedIn || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <div>
                <p className="text-sm text-gray-500">In Office</p>
                <p className="font-bold text-green-600">{stats.todayStats.inOffice || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="text-sm text-gray-500">Remote</p>
                <p className="font-bold text-orange-600">{stats.todayStats.remote || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📤</span>
              <div>
                <p className="text-sm text-gray-500">Checked Out</p>
                <p className="font-bold text-purple-600">{stats.todayStats.checkedOut || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Location History</h2>
          <span className="text-sm text-gray-500">
            {pagination.total} records found
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Geo-Location Logs Found</h3>
            <p className="text-gray-500">Location data will appear here when employees check in/out</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50 border-b border-blue-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">Check-In</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">Check-Out</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-blue-800">Office Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-blue-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr 
                      key={log._id} 
                      className={`border-b hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {log.user?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{log.user?.fullName || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{log.user?.department || 'No Department'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{formatDate(log.date)}</p>
                      </td>
                      <td className="py-3 px-4">
                        {log.checkIn?.time ? (
                          <div>
                            <p className="font-medium text-green-600">{formatTime(log.checkIn.time)}</p>
                            <p className="text-xs text-gray-400">
                              {log.checkIn.location?.latitude ? (
                                <span className="flex items-center gap-1">
                                  📍 {log.checkIn.location.latitude.toFixed(4)}, {log.checkIn.location.longitude.toFixed(4)}
                                </span>
                              ) : 'No location'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {log.checkOut?.time ? (
                          <div>
                            <p className="font-medium text-red-600">{formatTime(log.checkOut.time)}</p>
                            <p className="text-xs text-gray-400">
                              {log.checkOut.location?.latitude ? (
                                <span className="flex items-center gap-1">
                                  📍 {log.checkOut.location.latitude.toFixed(4)}, {log.checkOut.location.longitude.toFixed(4)}
                                </span>
                              ) : 'No location'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {log.checkIn?.isWithinOffice !== undefined && (
                            <Badge variant={log.checkIn.isWithinOffice ? 'success' : 'warning'}>
                              {log.checkIn.isWithinOffice ? '🏢 In Office' : '🌍 Remote'}
                            </Badge>
                          )}
                          {log.checkIn?.location?.address && (
                            <span className="text-xs text-gray-500 max-w-[150px] truncate" title={log.checkIn.location.address}>
                              {log.checkIn.location.address}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(log)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openMapView(log)}
                            className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                            title="View on Map"
                          >
                            🗺️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Page {pagination.current} of {pagination.pages} ({pagination.total} total records)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => fetchGeoLogs(pagination.current - 1)}
                  disabled={pagination.current <= 1}
                >
                  ← Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="hidden md:flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.current - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchGeoLogs(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          pagination.current === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <Button
                  variant="secondary"
                  onClick={() => fetchGeoLogs(pagination.current + 1)}
                  disabled={pagination.current >= pagination.pages}
                >
                  Next →
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="📍 Location Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedLog.user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedLog.user?.fullName || 'Unknown'}</h3>
                  <p className="text-gray-500">{selectedLog.user?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="info">{selectedLog.user?.role}</Badge>
                    <Badge variant="default">{selectedLog.user?.department || 'No Dept'}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-lg font-semibold">{formatDate(selectedLog.date)}</p>
            </div>

            {/* Check-In Details */}
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-xl">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📥</span> Check-In Details
              </h4>
              {selectedLog.checkIn?.time ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-green-700">{formatTime(selectedLog.checkIn.time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={selectedLog.checkIn.isWithinOffice ? 'success' : 'warning'}>
                      {selectedLog.checkIn.isWithinOffice ? '🏢 Within Office' : '🌍 Outside Office'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="font-mono text-sm bg-white p-2 rounded border">
                      {formatCoordinates(selectedLog.checkIn.location)}
                    </p>
                  </div>
                  {selectedLog.checkIn.location?.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm">{selectedLog.checkIn.location.address}</p>
                    </div>
                  )}
                  {selectedLog.checkIn.photo && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-2">Photo Verification</p>
                      <img 
                        src={selectedLog.checkIn.photo} 
                        alt="Check-in" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No check-in recorded</p>
              )}
            </div>

            {/* Check-Out Details */}
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-xl">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📤</span> Check-Out Details
              </h4>
              {selectedLog.checkOut?.time ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-red-700">{formatTime(selectedLog.checkOut.time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={selectedLog.checkOut.isWithinOffice ? 'success' : 'warning'}>
                      {selectedLog.checkOut.isWithinOffice ? '🏢 Within Office' : '🌍 Outside Office'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="font-mono text-sm bg-white p-2 rounded border">
                      {formatCoordinates(selectedLog.checkOut.location)}
                    </p>
                  </div>
                  {selectedLog.checkOut.location?.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm">{selectedLog.checkOut.location.address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No check-out recorded</p>
              )}
            </div>

            {/* Work Hours */}
            {selectedLog.workHours && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Work Hours</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.floor(selectedLog.workHours / 60)}h {selectedLog.workHours % 60}m
                    </p>
                  </div>
                  <div className="text-4xl">⏱️</div>
                </div>
              </div>
            )}

            {/* Device Info */}
            {selectedLog.checkIn?.deviceInfo && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-3">📱 Device Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-500">Device Type:</p>
                  <p>{selectedLog.checkIn.deviceInfo.deviceType || '-'}</p>
                  <p className="text-gray-500">Browser:</p>
                  <p>{selectedLog.checkIn.deviceInfo.browser || '-'}</p>
                  <p className="text-gray-500">OS:</p>
                  <p>{selectedLog.checkIn.deviceInfo.os || '-'}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedLog.notes && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">📝 Notes</h4>
                <p className="text-gray-700">{selectedLog.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setDetailModal(false)}>
                Close
              </Button>
              <Button onClick={() => { setDetailModal(false); openMapView(selectedLog); }} className="bg-blue-500 hover:bg-blue-600 text-white">
                🗺️ View on Map
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Map Modal */}
      <Modal
        isOpen={mapModal}
        onClose={() => setMapModal(false)}
        title="🗺️ Location Map"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Employee Info Header */}
            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {selectedLog.user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold">{selectedLog.user?.fullName}</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedLog.date)}</p>
              </div>
            </div>

            {/* Map Placeholder - Replace with actual map integration */}
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              {selectedLog.checkIn?.location?.latitude ? (
                <div className="relative">
                  {/* Static Map Image (using OpenStreetMap) */}
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLog.checkIn.location.longitude - 0.01}%2C${selectedLog.checkIn.location.latitude - 0.01}%2C${selectedLog.checkIn.location.longitude + 0.01}%2C${selectedLog.checkIn.location.latitude + 0.01}&layer=mapnik&marker=${selectedLog.checkIn.location.latitude}%2C${selectedLog.checkIn.location.longitude}`}
                    className="rounded-xl"
                  />
                  
                  {/* Location Legend */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Check-In: {formatTime(selectedLog.checkIn?.time)}</span>
                    </div>
                    {selectedLog.checkOut?.time && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span>Check-Out: {formatTime(selectedLog.checkOut.time)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-gray-500">No location data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">📥 Check-In Location</h4>
                {selectedLog.checkIn?.location ? (
                  <>
                    <p className="font-mono text-sm">{formatCoordinates(selectedLog.checkIn.location)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedLog.checkIn.isWithinOffice ? '✅ Within Office' : '⚠️ Outside Office'}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${selectedLog.checkIn.location.latitude},${selectedLog.checkIn.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      Open in Google Maps →
                    </a>
                  </>
                ) : (
                  <p className="text-gray-500">Not recorded</p>
                )}
              </div>

              <div className="bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2">📤 Check-Out Location</h4>
                {selectedLog.checkOut?.location ? (
                  <>
                    <p className="font-mono text-sm">{formatCoordinates(selectedLog.checkOut.location)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedLog.checkOut.isWithinOffice ? '✅ Within Office' : '⚠️ Outside Office'}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${selectedLog.checkOut.location.latitude},${selectedLog.checkOut.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      Open in Google Maps →
                    </a>
                  </>
                ) : (
                  <p className="text-gray-500">Not recorded</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setMapModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default GeoLocationLogs;