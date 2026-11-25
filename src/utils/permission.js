import { ROLES, OPS_ROLES } from '../constants/roles';

/**
 * Ma trận phân quyền giao diện (ẩn/hiện nút) — khớp 100% BE_QLKTX v3.0.
 * Backend luôn kiểm tra quyền độc lập trên từng endpoint.
 */
const { ADMIN, MANAGER } = ROLES;

const PERMISSIONS = {
  // Quản trị hệ thống — chỉ Admin
  'user:manage': [ADMIN],

  // Lãnh đạo / Cấu hình KTX — chỉ Manager
  'period:manage': [MANAGER],
  'building:create': [MANAGER],
  'building:update': [MANAGER],
  'room:create': [MANAGER],
  'room:update': [MANAGER],
  'dashboard:revenue': [MANAGER],
  'request:approveTransfer': [MANAGER],
  'announcement:delete': [MANAGER],

  // Vận hành KTX — Manager & Staff
  'student:create': OPS_ROLES,
  'student:update': OPS_ROLES,
  'student:delete': OPS_ROLES,
  'student:resetPassword': OPS_ROLES,

  'application:review': OPS_ROLES,
  'contract:cancel': OPS_ROLES,
  'contract:checkin': OPS_ROLES,
  'contract:terminate': OPS_ROLES,
  'contract:refundDeposit': OPS_ROLES,

  'utilityReading:record': OPS_ROLES,
  'payment:record': OPS_ROLES,
  'request:handle': OPS_ROLES,
  'announcement:create': OPS_ROLES,
};

export const can = (user, action) => {
  if (!user) return false;
  return PERMISSIONS[action]?.includes(user.role) ?? false;
};
