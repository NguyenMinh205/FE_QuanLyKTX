import { ROLES } from '../constants/roles';

/**
 * Ma trận quyền dùng cho GIAO DIỆN (ẩn/hiện nút) — khớp docs/07 mục 2.
 * Đây KHÔNG phải biện pháp bảo mật — backend vẫn phải kiểm tra lại.
 */
const { ADMIN, STAFF } = ROLES;
const OPS = [ADMIN, STAFF];

const PERMISSIONS = {
  'student:create': OPS,
  'student:update': OPS,
  'student:delete': OPS,
  'student:resetPassword': OPS,     // FR-06: Staff đặt lại được cho sinh viên, không cho Admin

  'building:create': OPS,
  'room:create': OPS,
  'room:update': OPS,

  'application:review': OPS,        // duyệt / từ chối
  'contract:terminate': OPS,        // thanh lý khi trả phòng
  'contract:refundDeposit': OPS,    // xác nhận đã hoàn cọc

  'utilityReading:record': OPS,    // nhập và chốt & phát hành
  'payment:record': OPS,           // thu tiền mặt, xác nhận VietQR

  // Màn Tài khoản chỉ Admin: chặn bằng vai trò ở AppRoutes, không qua bảng này
};

export const can = (user, action) => {
  if (!user) return false;
  return PERMISSIONS[action]?.includes(user.role) ?? false;
};
