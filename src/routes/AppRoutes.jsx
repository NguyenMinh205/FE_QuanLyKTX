import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import AdminLayout from '../layouts/AdminLayout';
import PortalLayout from '../layouts/PortalLayout';
import { ROLES, ADMIN_AREA_ROLES, OPS_ROLES } from '../constants/roles';
import { homePathOf } from './paths';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../features/auth/pages/LoginPage';
import ForbiddenPage from '../features/auth/pages/ForbiddenPage';
import NotFoundPage from '../features/auth/pages/NotFoundPage';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage';
import PublicHomePage from '../features/apply/pages/PublicHomePage';
import PublicApplyPage from '../features/apply/pages/PublicApplyPage';
import ApplicationStatusPage from '../features/apply/pages/ApplicationStatusPage';

import DashboardPage from '../features/dashboard/pages/DashboardPage';
import PeriodsPage from '../features/periods/pages/PeriodsPage';
import StudentsPage from '../features/students/pages/StudentsPage';
import UsersPage from '../features/users/pages/UsersPage';
import RoomsPage from '../features/rooms/pages/RoomsPage';
import BuildingsPage from '../features/rooms/pages/BuildingsPage';
import ApplicationsPage from '../features/applications/pages/ApplicationsPage';
import ContractsPage from '../features/contracts/pages/ContractsPage';
import RequestsPage from '../features/requests/pages/RequestsPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import UtilityReadingsPage from '../features/fees/pages/UtilityReadingsPage';
import InvoicesPage from '../features/fees/pages/InvoicesPage';
import InvoiceDetailPage from '../features/fees/pages/InvoiceDetailPage';
import PaymentsPage from '../features/payments/pages/PaymentsPage';

import PortalHomePage from '../features/portal/pages/PortalHomePage';
import MyResidencePage from '../features/portal/pages/MyResidencePage';
import MyInvoicesPage from '../features/portal/pages/MyInvoicesPage';
import PortalRequestsPage from '../features/portal/pages/PortalRequestsPage';
import ProfilePage from '../features/portal/pages/ProfilePage';

const { ADMIN, STUDENT } = ROLES;

/** Vào "/" khi đã đăng nhập → sang đúng khu vực; khách công khai → xem Trang thông tin & Bảng giá KTX */
function RootEntry() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={homePathOf(user.role)} replace />;
  return <PublicHomePage />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Công khai & 2 Cổng đăng nhập tách biệt ---------- */}
      <Route path="/" element={<RootEntry />} />
      <Route path="/login" element={<LoginPage key="student" portal="student" />} />
      <Route path="/admin/login" element={<LoginPage key="admin" portal="admin" />} />
      <Route path="/apply" element={<PublicApplyPage />} />
      <Route path="/apply/status" element={<ApplicationStatusPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* ---------- Đổi mật khẩu dùng chung khu quản trị (admin / manager / staff) ---------- */}
      <Route element={<RoleRoute allowed={ADMIN_AREA_ROLES}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* ---------- Nghiệp vụ KTX: chỉ manager & staff (RBAC v3.0 chặn admin) ---------- */}
      <Route element={<RoleRoute allowed={OPS_ROLES}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/periods" element={<PeriodsPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/buildings" element={<BuildingsPage />} />
        <Route path="/admin/rooms" element={<RoomsPage />} />
        <Route path="/admin/applications" element={<ApplicationsPage />} />
        <Route path="/admin/contracts" element={<ContractsPage />} />
        <Route path="/admin/requests" element={<RequestsPage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/utility-readings" element={<UtilityReadingsPage />} />
        <Route path="/admin/invoices" element={<InvoicesPage />} />
        <Route path="/admin/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/admin/payments" element={<PaymentsPage />} />
      </Route>

      {/* ---------- Quản trị hệ thống: chỉ admin ---------- */}
      <Route element={<RoleRoute allowed={[ADMIN]}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/users" element={<UsersPage />} />
      </Route>

      {/* ---------- Cổng sinh viên: chỉ student ---------- */}
      <Route element={<RoleRoute allowed={[STUDENT]}><PortalLayout /></RoleRoute>}>
        <Route path="/portal/home" element={<PortalHomePage />} />
        <Route path="/portal/change-password" element={<ChangePasswordPage />} />
        <Route path="/portal/my-residence" element={<MyResidencePage />} />
        <Route path="/portal/my-invoices" element={<MyInvoicesPage />} />
        <Route path="/portal/requests" element={<PortalRequestsPage />} />
        <Route path="/portal/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
