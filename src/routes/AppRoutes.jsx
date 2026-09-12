import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import AdminLayout from '../layouts/AdminLayout';
import PortalLayout from '../layouts/PortalLayout';
import { ROLES, ADMIN_AREA_ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../features/auth/pages/LoginPage';
import ForbiddenPage from '../features/auth/pages/ForbiddenPage';
import NotFoundPage from '../features/auth/pages/NotFoundPage';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import StudentsPage from '../features/students/pages/StudentsPage';
import PortalHomePage from '../features/portal/pages/PortalHomePage';
import PlaceholderPage from '../components/PlaceholderPage';

const { ADMIN, STUDENT } = ROLES;

/** Vào "/" thì đẩy về trang chủ đúng theo vai trò */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === STUDENT ? '/portal/home' : '/admin/dashboard'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Công khai ---------- */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* ---------- Khu quản trị: admin / staff / viewer ---------- */}
      <Route element={<RoleRoute allowed={ADMIN_AREA_ROLES}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/change-password" element={<ChangePasswordPage />} />

        <Route path="/admin/buildings" element={<PlaceholderPage title="Quản lý tòa nhà" module="rooms" apiGroup="/api/buildings" />} />
        <Route path="/admin/rooms" element={<PlaceholderPage title="Quản lý phòng" module="rooms" apiGroup="/api/rooms" />} />
        <Route path="/admin/beds/available" element={<PlaceholderPage title="Tra cứu giường trống" module="rooms" apiGroup="/api/beds/available" />} />
        <Route path="/admin/residencies" element={<PlaceholderPage title="Đăng ký lưu trú" module="residencies" apiGroup="/api/residencies" />} />
        <Route path="/admin/contracts" element={<PlaceholderPage title="Quản lý hợp đồng" module="contracts" apiGroup="/api/contracts" />} />
        <Route path="/admin/contracts/expiring" element={<PlaceholderPage title="Hợp đồng sắp hết hạn" module="contracts" apiGroup="/api/contracts/expiring" />} />
        <Route path="/admin/requests" element={<PlaceholderPage title="Yêu cầu gia hạn / trả phòng" module="requests" apiGroup="/api/requests" />} />
        <Route path="/admin/utility-readings" element={<PlaceholderPage title="Nhập chỉ số điện nước" module="fees" apiGroup="/api/utility-readings" />} />
        <Route path="/admin/invoices" element={<PlaceholderPage title="Quản lý hóa đơn" module="fees" apiGroup="/api/invoices" />} />
        <Route path="/admin/payments" element={<PlaceholderPage title="Lịch sử thanh toán" module="payments" apiGroup="/api/payments" />} />
      </Route>

      {/* ---------- Chỉ admin ---------- */}
      <Route element={<RoleRoute allowed={[ADMIN]}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/users" element={<PlaceholderPage title="Quản lý tài khoản" module="auth" apiGroup="/api/users" />} />
        <Route path="/admin/fee-types" element={<PlaceholderPage title="Danh mục loại phí" module="fees" apiGroup="/api/fee-types" />} />
      </Route>

      {/* ---------- Cổng sinh viên: chỉ student ---------- */}
      <Route element={<RoleRoute allowed={[STUDENT]}><PortalLayout /></RoleRoute>}>
        <Route path="/portal/home" element={<PortalHomePage />} />
        <Route path="/portal/change-password" element={<ChangePasswordPage />} />
        <Route path="/portal/my-residence" element={<PlaceholderPage title="Chỗ ở của tôi" module="portal" apiGroup="/api/portal/my-residence" />} />
        <Route path="/portal/my-contracts" element={<PlaceholderPage title="Hợp đồng của tôi" module="portal" apiGroup="/api/portal/my-contracts" />} />
        <Route path="/portal/my-invoices" element={<PlaceholderPage title="Hóa đơn của tôi" module="portal" apiGroup="/api/portal/my-invoices" />} />
        <Route path="/portal/my-requests" element={<PlaceholderPage title="Yêu cầu của tôi" module="portal" apiGroup="/api/portal/my-requests" />} />
        <Route path="/portal/profile" element={<PlaceholderPage title="Hồ sơ cá nhân" module="portal" apiGroup="/api/portal/profile" />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
