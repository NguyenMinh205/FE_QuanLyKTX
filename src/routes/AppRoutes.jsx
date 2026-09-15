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
import ApplyPage from '../features/portal/pages/ApplyPage';
import MyRequestsPage from '../features/portal/pages/MyRequestsPage';
import UsersPage from '../features/users/pages/UsersPage';
import RoomTypesPage from '../features/rooms/pages/RoomTypesPage';
import RoomsPage from '../features/rooms/pages/RoomsPage';
import ApplicationsPage from '../features/applications/pages/ApplicationsPage';
import ContractsPage from '../features/contracts/pages/ContractsPage';
import RequestsPage from '../features/requests/pages/RequestsPage';
import PlaceholderPage from '../components/PlaceholderPage';

const { ADMIN, STUDENT } = ROLES;

/** Vào "/" thì đẩy về trang chủ đúng theo vai trò */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === STUDENT ? '/portal/home' : '/admin/dashboard'} replace />;
}

/** Màn hình chưa làm — mã SCR và API tra ở docs/08 mục 5 */
const todo = (title, module, apiGroup) => <PlaceholderPage title={title} module={module} apiGroup={apiGroup} />;

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Công khai ---------- */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={todo('Đăng ký tài khoản sinh viên', 'auth', '/api/auth/register')} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* ---------- Khu quản trị: admin / staff / viewer ---------- */}
      <Route element={<RoleRoute allowed={ADMIN_AREA_ROLES}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/change-password" element={<ChangePasswordPage />} />

        <Route path="/admin/buildings" element={todo('Tòa nhà', 'rooms', '/api/buildings')} />
        <Route path="/admin/room-types" element={<RoomTypesPage />} />
        <Route path="/admin/rooms" element={<RoomsPage />} />
        <Route path="/admin/applications" element={<ApplicationsPage />} />
        <Route path="/admin/contracts" element={<ContractsPage />} />
        <Route path="/admin/requests" element={<RequestsPage />} />
        <Route path="/admin/utility-readings" element={todo('Nhập chỉ số điện nước', 'fees', '/api/utility-readings')} />
        <Route path="/admin/invoices" element={todo('Quản lý hóa đơn', 'fees', '/api/invoices')} />
        <Route path="/admin/invoices/:id" element={todo('Chi tiết hóa đơn', 'fees', '/api/invoices/:id')} />
        <Route path="/admin/payments" element={todo('Lịch sử thanh toán', 'payments', '/api/payments')} />
        <Route path="/admin/supplies" element={todo('Nhu yếu phẩm', 'supplies', '/api/supply-orders')} />
      </Route>

      {/* ---------- Chỉ admin ---------- */}
      <Route element={<RoleRoute allowed={[ADMIN]}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/fee-types" element={todo('Danh mục loại phí', 'fees', '/api/fee-types')} />
      </Route>

      {/* ---------- Cổng sinh viên: chỉ student ---------- */}
      <Route element={<RoleRoute allowed={[STUDENT]}><PortalLayout /></RoleRoute>}>
        <Route path="/portal/home" element={<PortalHomePage />} />
        <Route path="/portal/change-password" element={<ChangePasswordPage />} />
        <Route path="/portal/apply" element={<ApplyPage />} />
        <Route path="/portal/my-residence" element={todo('Chỗ ở & hợp đồng', 'portal', '/api/portal/my-residence')} />
        <Route path="/portal/my-invoices" element={todo('Hóa đơn của tôi', 'portal', '/api/portal/my-invoices')} />
        <Route path="/portal/payment-result" element={todo('Kết quả thanh toán', 'payments', '/api/payments')} />
        <Route path="/portal/my-requests" element={<MyRequestsPage />} />
        <Route path="/portal/shop" element={todo('Mua sắm nhu yếu phẩm', 'portal', '/api/portal/supply-items')} />
        <Route path="/portal/my-orders" element={todo('Đơn hàng của tôi', 'portal', '/api/portal/my-supply-orders')} />
        <Route path="/portal/profile" element={todo('Hồ sơ cá nhân', 'portal', '/api/portal/profile')} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
