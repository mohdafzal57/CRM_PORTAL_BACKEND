import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Button } from '../../components/admin/ui';
import * as api from '../../services/adminApi';

// Constants
const EXPORT_TYPES = [
  { value: 'users', label: 'Employees', icon: '👥' },
  { value: 'attendance', label: 'Attendance', icon: '📅' },
  { value: 'reports', label: 'Work Reports', icon: '📝' }
];

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'pdf', label: 'PDF (.pdf)' }
];

const QUICK_EXPORTS = [
  {
    type: 'users',
    format: 'excel',
    label: 'All Employees (Excel)',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    textColor: 'text-green-700'
  },
  {
    type: 'attendance',
    format: 'excel',
    label: 'Attendance Report (Excel)',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    textColor: 'text-blue-700'
  },
  {
    type: 'reports',
    format: 'pdf',
    label: 'Work Reports (PDF)',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    textColor: 'text-purple-700'
  }
];

const ExportCenter = () => {
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

  const handleQuickExport = async (type, format) => {
    try {
      await api.exportData(type, format);
      alert('Export started! File will download shortly.');
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Export Center</h1>
        <p className="text-gray-500 mt-1">Export data to Excel or PDF</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">📤 Export Configuration</h2>

          {/* Data Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Data Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPORT_TYPES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setExportType(item.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    exportType === item.value
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

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Format
            </label>
            <div className="flex gap-4">
              {EXPORT_FORMATS.map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
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

        {/* Quick Export */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">⚡ Quick Export</h2>
          <div className="space-y-4">
            {QUICK_EXPORTS.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickExport(item.type, item.format)}
                className={`w-full p-4 ${item.bgColor} ${item.hoverColor} rounded-xl transition-colors text-left flex items-center justify-between`}
              >
                <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                <span>📤</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ExportCenter;