import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Chặn truy cập theo đăng nhập + vai trò.
 * ⚠️ Đây CHỈ là trải nghiệm người dùng, KHÔNG phải bảo mật.
 * Backend vẫn phải kiểm tra quyền trên từng API (docs/07 mục 3.1).
 *
 * @example
 * <Route element={<RoleRoute allowed={['ADMIN','STAFF']}><AdminLayout /></RoleRoute>}>
 */
export default function RoleRoute({ allowed, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}
