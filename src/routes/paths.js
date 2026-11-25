import { ROLES } from '../constants/roles';

/** Trang chủ mặc định theo vai trò v3.0 */
export const homePathOf = (role) => {
  if (role === ROLES.STUDENT) return '/portal/home';
  if (role === ROLES.ADMIN) return '/admin/users';
  return '/admin/dashboard';
};

/** Trang đổi mật khẩu theo khu vực của vai trò */
export const changePasswordPathOf = (role) =>
  (role === ROLES.STUDENT ? '/portal/change-password' : '/admin/change-password');

/**
 * Chỉ quay lại trang cũ nếu trang đó thuộc khu vực hợp lệ của vai trò.
 * Tránh Admin bị đẩy vào /admin/dashboard (403) hay SV bị đẩy vào /admin/*.
 */
export const safeRedirectPath = (role, from) => {
  if (typeof from !== 'string' || from.includes('change-password')) return homePathOf(role);
  if (role === ROLES.STUDENT) return from.startsWith('/portal/') ? from : homePathOf(role);
  if (role === ROLES.ADMIN) return from.startsWith('/admin/users') ? from : homePathOf(role);
  return from.startsWith('/admin/') && !from.startsWith('/admin/users') ? from : homePathOf(role);
};
