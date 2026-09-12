import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import AdminLayout from '../components/layout/AdminLayout';
import PortalLayout from '../components/layout/PortalLayout';
import { ROLES, ADMIN_AREA_ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../pages/auth/LoginPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import StudentListPage from '../pages/students/StudentListPage';
import PortalHomePage from '../pages/portal/PortalHomePage';
import PlaceholderPage from '../pages/PlaceholderPage';

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

      {/* ---------- Khu quản trị: ADMIN / STAFF / VIEWER ---------- */}
      <Route element={<RoleRoute allowed={ADMIN_AREA_ROLES}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/students" element={<StudentListPage />} />

        <Route path="/admin/buildings" element={<PlaceholderPage title="Quản lý tòa nhà" taskId="T3.5" screenId="SCR-21" />} />
        <Route path="/admin/rooms" element={<PlaceholderPage title="Quản lý phòng" taskId="T3.5" screenId="SCR-23" />} />
        <Route path="/admin/beds/available" element={<PlaceholderPage title="Tra cứu giường trống" taskId="T3.7" screenId="SCR-25" />} />
        <Route path="/admin/contracts" element={<PlaceholderPage title="Danh sách hợp đồng" taskId="T3.10" screenId="SCR-31" />} />
        <Route path="/admin/contracts/pending" element={<PlaceholderPage title="Đơn chờ duyệt" taskId="T3.11" screenId="SCR-32" />} />
        <Route path="/admin/contracts/expiring" element={<PlaceholderPage title="Hợp đồng sắp hết hạn" taskId="T3.9" screenId="SCR-35" />} />
        <Route path="/admin/requests" element={<PlaceholderPage title="Yêu cầu gia hạn / trả phòng" taskId="T3.14" screenId="SCR-41" />} />
        <Route path="/admin/invoices" element={<PlaceholderPage title="Quản lý hóa đơn" taskId="T4.7" screenId="SCR-51" />} />
        <Route path="/admin/utility-readings" element={<PlaceholderPage title="Nhập chỉ số điện nước" taskId="T4.3" screenId="SCR-55" />} />
        <Route path="/admin/payments" element={<PlaceholderPage title="Lịch sử thanh toán" taskId="T4.11" screenId="SCR-56" />} />
        <Route path="/admin/reports" element={<PlaceholderPage title="Trung tâm báo cáo" taskId="T6.5" screenId="SCR-57" />} />
      </Route>

      {/* ---------- Chỉ ADMIN ---------- */}
      <Route element={<RoleRoute allowed={[ADMIN]}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/users" element={<PlaceholderPage title="Quản lý tài khoản" taskId="T3.17" screenId="SCR-81" />} />
        <Route path="/admin/fee-types" element={<PlaceholderPage title="Danh mục loại phí" taskId="T4.3" screenId="SCR-82" />} />
        <Route path="/admin/settings" element={<PlaceholderPage title="Cấu hình hệ thống" taskId="—" screenId="SCR-83" />} />
      </Route>

      {/* ---------- Cổng sinh viên: chỉ STUDENT ---------- */}
      <Route element={<RoleRoute allowed={[STUDENT]}><PortalLayout /></RoleRoute>}>
        <Route path="/portal/home" element={<PortalHomePage />} />
        <Route path="/portal/my-residence" element={<PlaceholderPage title="Chỗ ở của tôi" taskId="T5.6" screenId="SCR-62" />} />
        <Route path="/portal/my-contracts" element={<PlaceholderPage title="Hợp đồng của tôi" taskId="T5.6" screenId="SCR-65" />} />
        <Route path="/portal/my-invoices" element={<PlaceholderPage title="Hóa đơn của tôi" taskId="T5.8" screenId="SCR-66" />} />
        <Route path="/portal/my-requests" element={<PlaceholderPage title="Yêu cầu của tôi" taskId="T5.10" screenId="SCR-69" />} />
        <Route path="/portal/profile" element={<PlaceholderPage title="Hồ sơ cá nhân" taskId="T5.5" screenId="SCR-72" />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
