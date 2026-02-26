import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  AttendanceReports,
  Dashboard,
  ExportCenter,
  GeoLocationLogs,
  SettingsPage,
  UserManagement,
  WorkReports
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
      <Route path="/crm/work-queue" element={<WorkQueue />} />
      <Route path="/crm/orders" element={<Orders />} />
    </Routes>
  );
};

export default AdminRoutes;