import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Shared Components & Layouts
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import AgencyLayout from './components/AgencyLayout';
import GuardLayout from './components/GuardLayout';
import MapControl from './components/MapControl';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage';
import GuardProvisioningPage from './pages/admin/GuardProvisioningPage';

// Operations Pages
import OverviewPage from './pages/ops/OverviewPage';
import ContractsPage from './pages/ops/ContractsPage';
import GuardsPage from './pages/ops/GuardsPage';
import SchedulesPage from './pages/ops/SchedulesPage';
import LogsPage from './pages/ops/LogsPage';
import ReportsPage from './pages/ops/ReportsPage';

// Agency Pages
import AgencyGuardsPage from './pages/agency/AgencyGuardsPage';

// Client Pages
import ClientContractsPage from './pages/client/ClientContractsPage';
import ClientGuardsPage from './pages/client/ClientGuardsPage';

// Guard Pages
import GuardDashboard from './pages/guard/Dashboard';
import GuardMyShifts from './pages/guard/MyShifts';
import GuardReportIncident from './pages/guard/ReportIncident';

// Common Pages
import RoleSettingsPage from './pages/common/RoleSettingsPage';
import ServiceRequestsPage from './pages/common/ServiceRequestsPage';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('spms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: any) => {
    setUser(u);
    localStorage.setItem('spms_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('spms_user');
    localStorage.removeItem('spms_token');
    window.location.href = '/';
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <Navigate
              to={
                user?.role === 'ADMIN'
                  ? '/admin'
                  : user?.role === 'AGENCY_MANAGER'
                  ? '/agency'
                  : user?.role === 'CLIENT'
                  ? '/client'
                  : user?.role === 'GUARD'
                  ? '/guard'
                  : '/dashboard'
              }
              replace
            />
          }
        />

        {/* Guard Sphere */}
        <Route
          path="/guard"
          element={
            <ProtectedRoute allowed={['GUARD']} role={user?.role}>
              <GuardLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<GuardDashboard />} />
          <Route path="shifts" element={<GuardMyShifts />} />
          <Route path="incidents" element={<GuardReportIncident />} />
          <Route path="settings" element={<RoleSettingsPage user={user} />} />
        </Route>

        {/* Admin Sphere */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowed={['ADMIN']} role={user?.role}>
              <AdminLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserManagementPage />} />
          <Route path="guards" element={<GuardProvisioningPage />} />
          <Route path="settings" element={<RoleSettingsPage user={user} />} />
        </Route>

        {/* Agency Sphere */}
        <Route
          path="/agency"
          element={
            <ProtectedRoute allowed={['AGENCY_MANAGER']} role={user?.role}>
              <AgencyLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AgencyGuardsPage />} />
          <Route path="schedules" element={<SchedulesPage role={user?.role} />} />
          <Route path="logs" element={<LogsPage role={user?.role} />} />
          <Route path="reports" element={<ReportsPage role={user?.role} />} />
          <Route path="settings" element={<RoleSettingsPage user={user} />} />
        </Route>

        {/* Ops Sphere */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowed={['OPERATION_MANAGER']} role={user?.role}>
              <DashboardLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage role={user?.role} />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="guards" element={<GuardsPage />} />
          <Route path="schedules" element={<SchedulesPage role={user?.role} />} />
          <Route path="logs" element={<LogsPage role={user?.role} />} />
          <Route path="reports" element={<ReportsPage role={user?.role} />} />
          <Route path="requests" element={<ServiceRequestsPage />} />
          <Route path="settings" element={<RoleSettingsPage user={user} />} />
          <Route path="*" element={<div>Page under construction</div>} />
        </Route>

        <Route
          path="/map"
          element={
            <ProtectedRoute allowed={['OPERATION_MANAGER']} role={user?.role}>
              <DashboardLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<MapControl />} />
        </Route>

        {/* Client Sphere */}
        <Route
          path="/client"
          element={
            <ProtectedRoute allowed={['CLIENT']} role={user?.role}>
              <ClientLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientContractsPage user={user} />} />
          <Route path="guards" element={<ClientGuardsPage />} />
          <Route path="schedules" element={<SchedulesPage role={user?.role} />} />
          <Route path="reports" element={<ReportsPage role={user?.role} />} />
          <Route path="settings" element={<RoleSettingsPage user={user} />} />
          <Route path="*" element={<div>Client Module under construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
