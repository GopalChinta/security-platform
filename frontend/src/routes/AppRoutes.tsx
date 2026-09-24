import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Pages
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Campaigns } from '../pages/Campaigns';
import { CampaignDetail } from '../pages/CampaignDetail';
import { SecurityEvents } from '../pages/SecurityEvents';
import { Users } from '../pages/Users';
import { AuditLogs } from '../pages/AuditLogs';
import { CrossTenantDemo } from '../pages/CrossTenantDemo';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside DashboardLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />
        <Route path="security-events" element={<SecurityEvents />} />

        {/* Administration Routes restricted to ADMIN and MANAGER */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        {/* Security Lab */}
        <Route path="cross-tenant-demo" element={<CrossTenantDemo />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
