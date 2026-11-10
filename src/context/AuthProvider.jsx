import { useState, useCallback, useMemo, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../lib/authApi';
import { authStorage } from '../lib/authStorage';
import { ROLES } from '../constants/roles';

const VALID_ROLES = Object.values(ROLES);

/**
 * Đọc phiên đã lưu. Phiên hỏng hoặc từ phiên bản cũ (VD vai trò viết hoa 'ADMIN') bị xóa luôn,
 * tránh kẹt ở trang 403 mà không có cách đăng xuất.
 */
const readStoredSession = () => {
  const user = authStorage.getToken() ? authStorage.getUser() : null;
  if (user && VALID_ROLES.includes(user.role)) return user;
  authStorage.clear();
  return null;
};

/** Bọc quanh toàn bộ ứng dụng ở main.jsx */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredSession);

  /**
   * @param {boolean} remember true = giữ phiên sau khi đóng trình duyệt (localStorage)
   * @returns user vừa đăng nhập — gồm role và mustChangePassword để trang đăng nhập điều hướng
   */
  const login = useCallback(async (identifier, password, remember = true) => {
    const res = await authApi.login({ identifier, password });
    const { token, user: loggedInUser } = res.data.data;
    authStorage.save({ token, user: loggedInUser }, remember);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Gọi API đăng xuất lỗi cũng không sao, vẫn phải xóa phiên phía client
    }
    authStorage.clear();
    setUser(null);
  }, []);

  /** Ghép thêm thông tin vào người dùng hiện tại, VD { mustChangePassword: false } sau khi đổi mật khẩu */
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      authStorage.updateUser(next);
      return next;
    });
  }, []);

  // ⚠️ Tab khác đăng nhập tài khoản khác / đăng xuất (cùng localStorage): tab này phải tải lại, không thì màn hình
  // vẫn mang tên người cũ trong khi mọi request đã đi bằng token của người mới
  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'token' || e.key === null) window.location.reload(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout, updateUser }),
    [user, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
