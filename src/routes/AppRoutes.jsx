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
import BuildingsPage from '../features/rooms/pages/BuildingsPage';
import FeeTypesPage from '../features/fees/pages/FeeTypesPage';
import UtilityReadingsPage from '../features/fees/pages/UtilityReadingsPage';
import InvoicesPage from '../features/fees/pages/InvoicesPage';
import InvoiceDetailPage from '../features/fees/pages/InvoiceDetailPage';
import PaymentsPage from '../features/payments/pages/PaymentsPage';
import SuppliesPage from '../features/supplies/pages/SuppliesPage';
import MyResidencePage from '../features/portal/pages/MyResidencePage';
import ProfilePage from '../features/portal/pages/ProfilePage';
import MyInvoicesPage from '../features/portal/pages/MyInvoicesPage';
import PaymentResultPage from '../features/portal/pages/PaymentResultPage';
import ShopPage from '../features/portal/pages/ShopPage';
import MyOrdersPage from '../features/portal/pages/MyOrdersPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ApplicationsPage from '../features/applications/pages/ApplicationsPage';
import ContractsPage from '../features/contracts/pages/ContractsPage';
import RequestsPage from '../features/requests/pages/RequestsPage';

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
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* ---------- Khu quản trị: admin / staff / viewer ---------- */}
      <Route element={<RoleRoute allowed={ADMIN_AREA_ROLES}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/change-password" element={<ChangePasswordPage />} />

        <Route path="/admin/buildings" element={<BuildingsPage />} />
        <Route path="/admin/room-types" element={<RoomTypesPage />} />
        <Route path="/admin/rooms" element={<RoomsPage />} />
        <Route path="/admin/applications" element={<ApplicationsPage />} />
        <Route path="/admin/contracts" element={<ContractsPage />} />
        <Route path="/admin/requests" element={<RequestsPage />} />
        <Route path="/admin/utility-readings" element={<UtilityReadingsPage />} />
        <Route path="/admin/invoices" element={<InvoicesPage />} />
        <Route path="/admin/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/admin/payments" element={<PaymentsPage />} />
        <Route path="/admin/supplies" element={<SuppliesPage />} />
      </Route>

      {/* ---------- Chỉ admin ---------- */}
      <Route element={<RoleRoute allowed={[ADMIN]}><AdminLayout /></RoleRoute>}>
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/fee-types" element={<FeeTypesPage />} />
      </Route>

      {/* ---------- Cổng sinh viên: chỉ student ---------- */}
      <Route element={<RoleRoute allowed={[STUDENT]}><PortalLayout /></RoleRoute>}>
        <Route path="/portal/home" element={<PortalHomePage />} />
        <Route path="/portal/change-password" element={<ChangePasswordPage />} />
        <Route path="/portal/apply" element={<ApplyPage />} />
        <Route path="/portal/my-residence" element={<MyResidencePage />} />
        <Route path="/portal/my-invoices" element={<MyInvoicesPage />} />
        <Route path="/portal/payment-result" element={<PaymentResultPage />} />
        <Route path="/portal/my-requests" element={<MyRequestsPage />} />
        <Route path="/portal/shop" element={<ShopPage />} />
        <Route path="/portal/my-orders" element={<MyOrdersPage />} />
        <Route path="/portal/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
