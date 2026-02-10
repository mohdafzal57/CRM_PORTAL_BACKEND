import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Button, Input, Select, Loading } from '../../components/admin/ui';
import * as api from '../../services/adminApi';

// Constants
const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' }
];

const SettingsPage = () => {
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

  // Helper function to update nested settings
  const updateSettings = (path, value) => {
    setSettings((prev) => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
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
            onChange={(e) => updateSettings('officeLocation.address', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              value={settings?.officeLocation?.latitude || ''}
              onChange={(e) =>
                updateSettings('officeLocation.latitude', parseFloat(e.target.value))
              }
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              value={settings?.officeLocation?.longitude || ''}
              onChange={(e) =>
                updateSettings('officeLocation.longitude', parseFloat(e.target.value))
              }
            />
          </div>
          <Input
            label="Geofence Radius (km)"
            type="number"
            step="0.01"
            value={settings?.officeLocation?.radius || 0.1}
            onChange={(e) =>
              updateSettings('officeLocation.radius', parseFloat(e.target.value))
            }
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
              onChange={(e) => updateSettings('workingHours.start', e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              value={settings?.workingHours?.end || '18:00'}
              onChange={(e) => updateSettings('workingHours.end', e.target.value)}
            />
          </div>
          <Select
            label="Timezone"
            value={settings?.timezone || 'UTC'}
            onChange={(e) => updateSettings('timezone', e.target.value)}
            options={TIMEZONE_OPTIONS}
          />
        </Card>

        {/* Company Info */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">🏢 Company Information</h2>
          <Input
            label="Company Name"
            value={settings?.name || ''}
            onChange={(e) => updateSettings('name', e.target.value)}
          />
          <Input
            label="Contact Email"
            type="email"
            value={settings?.contactEmail || ''}
            onChange={(e) => updateSettings('contactEmail', e.target.value)}
          />
          <Input
            label="Contact Phone"
            value={settings?.contactPhone || ''}
            onChange={(e) => updateSettings('contactPhone', e.target.value)}
          />
        </Card>

        {/* Policies */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">📋 Policies</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Policy
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              value={settings?.policies?.leave || ''}
              onChange={(e) => updateSettings('policies.leave', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Policy
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              value={settings?.policies?.attendance || ''}
              onChange={(e) => updateSettings('policies.attendance', e.target.value)}
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;