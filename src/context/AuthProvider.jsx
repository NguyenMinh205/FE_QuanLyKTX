import { useState, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../lib/authApi';
import { authStorage } from '../lib/authStorage';

/** Bọc quanh toàn bộ ứng dụng ở main.jsx */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (authStorage.getToken() ? authStorage.getUser() : null));

  /**
   * @param {boolean} remember true = giữ phiên sau khi đóng trình duyệt (localStorage)
   * @returns user vừa đăng nhập — gồm role và mustChangePassword để trang đăng nhập điều hướng
   */
  const login = useCallback(async (email, password, remember = true) => {
    const res = await authApi.login({ email, password });
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

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout, updateUser }),
    [user, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
