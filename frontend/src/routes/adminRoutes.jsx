import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Dashboard,
  UserManagement,
  AttendanceReports,
  GeoLocationLogs,
  WorkReports,
  ExportCenter,
  SettingsPage
} from '../pages/admin';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/attendance" element={<AttendanceReports />} />
      <Route path="/geo-logs" element={<GeoLocationLogs />} />
      <Route path="/reports" element={<WorkReports />} />
      <Route path="/export" element={<ExportCenter />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

export default AdminRoutes;