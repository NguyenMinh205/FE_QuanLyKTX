import { ROLES } from '../constants/roles';

/** Trang chủ theo vai trò */
export const homePathOf = (role) => (role === ROLES.STUDENT ? '/portal/home' : '/admin/dashboard');

/** Trang đổi mật khẩu theo khu vực của vai trò */
export const changePasswordPathOf = (role) => (role === ROLES.STUDENT ? '/portal/change-password' : '/admin/change-password');

/**
 * Chỉ quay lại trang cũ nếu trang đó thuộc khu vực của vai trò — tránh sinh viên đăng nhập xong bị đẩy vào /admin rồi dính 403.
 */
export const safeRedirectPath = (role, from) => {
  const area = role === ROLES.STUDENT ? '/portal/' : '/admin/';
  return typeof from === 'string' && from.startsWith(area) ? from : homePathOf(role);
};
